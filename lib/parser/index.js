// args <https://github.com/msikma/args>
// © MIT license

const { parseCommand } = require('cmd-tokenize')
const { log } = require('../util')
const { ParseError, InternalError } = require('../error')
const { isInteger } = require('../util')
const { validateValues } = require('./validate')
const { getArgv } = require('./argv')

const createInitialParseState = allObjects => {
  const cmdState = {}
  for (const cmd of Object.values(allObjects)) {
    const initialState = {}
    const argsState = {}
    const cmds = {}
    const opts = {}
    const pos = {}

    for (const arg of cmd.objects) {
      initialState[arg.id] = getDefaultValue(arg.opts)
      argsState[arg.id] = {
        isConsumed: false,
        isOptional: arg.isOption,
        isRequired: arg.opts.required,
        input: null,
        codes: arg.codes.map(code => code.details),
        ref: arg
      }
      for (const code of arg.codes) {
        const dict = arg.isOption ? opts : pos
        dict[code.details.content] = {
          ...code.details,
          ref: arg
        }
      }
    }
    for (const id of cmd.children) {
      cmds[allObjects[id].name] = id
    }
    cmdState[cmd.id] = {
      id: cmd.id,
      name: cmd.name,
      initialState,
      argsState,
      cmds,
      opts,
      pos: Object.values(pos),
      ref: cmd.ref
    }
  }
  return [cmdState, '_1']
}

/**
 * Base function for parseArguments() and parseArgumentsObject().
 * 
 * Parses the user's command line arguments and either returns the result or prints it and exits.
 */
const parseArgumentsBase = exitOnFeedback => (parserReference, argRef) => {
  try {
    const { parserOptions } = parserReference.settings
    const allObjects = parserReference.getArgumentHierarchy()
    const [callbacks, result] = parseArgumentObject(argRef, allObjects, parserOptions)
    parserReference.runArgumentCallbacks(callbacks, exitOnFeedback)
    return result
  }
  catch (err) {
    if (exitOnFeedback) {
      return parserReference.exitWithError(err)
    }
    else {
      throw err
    }
  }
}

/**
 * Regular parseArguments() function that exits the program on error or if --help or --version are passed.
 * 
 * This is designed for CLI tools and is the function most people would use.
 */
const parseArguments = parseArgumentsBase(true)

/**
 * Alternate version of parseArguments() that throws errors and never exits the program.
 * 
 * This is used if you don't want the program to exit depending on the given input.
 */
const getParsedArguments = parseArgumentsBase(false)

/**
 * Parses the user's command line arguments and returns an object matching them with our defined arguments.
 * 
 * This is called from parseArguments(). This function is used to set up scanArguments(), which does the
 * actual parsing work and throws on errors; when using parseArguments(), any errors are caught
 * and displayed before exiting the program, which is what you'd normally want in a command line tool.
 * 
 * Either a string or an array can be passed; usually we'll get an array from process.argv.
 * If a string is passed, it is split as though it's a command typed on the command line, which requires
 * that the string is properly escaped and doesn't have unbalanced quotes;
 * see <https://github.com/msikma/cmd-tokenize> for specifics on how this works.
 * 
 * To parse the user's arguments, first we check each item to see if it's an option or a regular argument,
 * along with various other things. Then we iterate through them one by one and check them against
 * the defined commands, arguments and values in the parser.
 * 
 * If at any point an argument is invalid (e.g. the wrong type), or a required argument is missing,
 * or an unknown argument is passed, the parser will throw an error.
 * 
 * Positional arguments need to be consumed in order. Optional arguments can be given in any order.
 */
const parseArgumentObject = (argRef, allObjects, parserOptions) => {
  // Whether to unpack combined options, like '-ab' to ['-a', '-b'].
  const { useSingleDashOptions } = parserOptions

  // Default to the argv array.
  if (!argRef) {
    argRef = getArgv().args
  }

  // Parse the given arguments; if a string is passed, this safely splits the string up into an array.
  // See <https://github.com/msikma/cmd-tokenize> for information on the result object.
  const parsed = parseCommand(argRef, { firstIsExec: false, unpackCombinedOptions: !useSingleDashOptions })

  // Get a list of all commands and arguments we'll be looking for.
  // To keep track of which arguments have been consumed, a state object is made.
  // We also make a separate list of options for easy lookup.
  const [cmdState, rootCmd] = createInitialParseState(allObjects)
  
  // We iterate over the user's arguments and try to consume them one by one.
  // This modifies 'parsed.arguments' and 'argsState'. If any of the passed options are invalid we error out.
  const [result, initialState, cmdList, argsState] = scanArguments(parsed.arguments, cmdState, rootCmd)
  
  // After passing over what the user passed on the command line, we check to make sure there are no
  // required arguments left that haven't been consumed.
  const [argsMissing] = getUnusedArguments(argsState)

  // Check whether any callbacks (user-defined, or special ones like --help) need to be performed.
  const callbacks = getArgumentCallbacks(result, argsState)

  if (Object.keys(argsMissing).length && !callbacks.hasPendingSystemCallbacks) {
    throw new ParseError({ code: 'MISSING_ARGUMENTS', argsMissing: Object.values(argsMissing) })
  }
  
  return [callbacks, wrapReturnValue(result, initialState, cmdList, argsState, parsed)]
}

/**
 * Returns lists of all callbacks (both user-defined and special callbacks) from the arguments a user input.
 * 
 * This is a list of functions we need to perform after parsing. Special/system callbacks have priority
 * over regular callbacks and they include things like the --help and --version output.
 */
const getArgumentCallbacks = (resultObject, argsState) => {
  const ids = Object.keys(resultObject)
  const callbacks = []
  const systemCallbacks = []
  for (const id of ids) {
    const arg = argsState[id]
    const argCallback = arg.ref.opts.callback
    const argSysCallback = arg.ref.typeData?.properties?.systemCallback

    // Check if this argument has a special callback; e.g. the --help argument.
    // These always immediately activate and override all other actions.
    if (argSysCallback) {
      systemCallbacks.push({ callback: argCallback, identifier: argSysCallback, callArguments: { input: arg.input, argument: arg.ref } })
    }

    // Save this argument's callback function and the arguments we'll call it with.
    if (argCallback) {
      callbacks.push({ callback: argCallback, callArguments: { input: arg.input, argument: arg.ref } })
    }
  }
  
  return {
    callbacks,
    systemCallbacks,
    hasPendingSystemCallbacks: systemCallbacks.length > 0
  }
}

/**
 * Converts an object of parse results to use argument keys instead of internal IDs.
 * 
 * This is done to create the object that the user will actually be able to use in their code,
 * with the user-entered values indexed by their corresponding argument key.
 * 
 * 'getCmds' returns only the commands if true, or only the arguments if false.
 * If 'initialObject' is set, its values are used as defaults.
 */
const mapInternalIDsToKeys = (resultObject, argsState, getCmds, initialObject = {}) => {
  const mapped = Object.entries(resultObject).map(([id, value]) => [argsState[id].ref.key, value, argsState[id].ref.type === 'command'])
  return {
    ...initialObject,
    ...Object.fromEntries(mapped.filter(arg => arg[2] === getCmds))
  }
}

/**
 * Returns a list of unconsumed and missing arguments.
 * 
 * Unconsumed arguments are all arguments that are defined but that the user did not enter.
 * Missing arguments is a subset of that, containing only arguments that were marked as required.
 * 
 * Unconsumed is OK. Missing is an error.
 */
const getUnusedArguments = argsState => {
  const argsUnconsumed = Object.entries(argsState).filter(([, opt]) => !opt.isConsumed)
  const argsMissing = argsUnconsumed.filter(([, opt]) => opt.isRequired)
  return [Object.fromEntries(argsMissing), Object.fromEntries(argsUnconsumed)]
}

/**
 * Wraps the parsing result in an object.
 */
const wrapReturnValue = (result, initialState, cmdList, argsState, parsedCommand) => {
  const mappedInitialState = mapInternalIDsToKeys(initialState, argsState, false)
  return {
    arguments: mapInternalIDsToKeys(result, argsState, false, mappedInitialState),
    commands: cmdList,
    meta: {
      initialState: mappedInitialState,
      command: parsedCommand.commandSplit
    }
  }
}

/**
 * Returns the state object for a given argument.
 * 
 * This object contains information used to parse the argument.
 */
const getArgumentStateObject = (argInput, cmds, opts, pos, cmdState) => {
  const value = argInput.content

  // First check if this is a command, as they change what arguments we'll accept from here on.
  if (cmds[value]) {
    return cmdState[cmds[value]]
  }
  // If this is a positional argument, grab the next item from the list.
  if (!argInput.isOption) {
    return pos.shift()
  }
  // If this is an option, return the corresponding item by string lookup.
  if (opts[value]) {
    return opts[value]
  }
  return null
}

/**
 * Iterates over the user's command line arguments and extracts their data per our argument definitions.
 * 
 * This does the bulk of the actual parsing work. If something isn't right, a ParseError is thrown.
 * 
 * When iteration begins, the parser first checks to see if any commands are entered. Based on that,
 * a context is selected (a context being a group of accepted optional and positional arguments),
 * and the rest of the arguments are then parsed one by one.
 * 
 * A command will always come at the start, and as soon as any non-command argument is encountered
 * they may no longer be used; all non-options are treated as positional arguments from that moment on.
 * 
 * If no commands are used, the arguments defined on the parser itself are used as the context.
 * (Internally, the arguments are actually defined on a hidden command called the "root command".)
 * 
 * Each item from 'passedArguments' is an item returned by cmd-tokenize. This function will modify
 * the 'passedArguments' and 'cmdState' objects.
 */
const scanArguments = (passedArguments, cmdState, rootCmd) => {
  // Retrieves the next argument in line.
  const next = () => passedArguments.shift()
  const putBack = (arg) => passedArguments.unshift(arg)

  // State for the parser.
  let state = {}, activeCmd, cmdList = [], canSwitchCmds = true
  // State for the currently active command.
  let initialState, argsState, cmds, opts, pos
  // State for the current argument.
  let argInput, argObj, argRef, isCmd, value, values

  /** Switches the parser to a different active command. */
  const setActiveCmd = (id, skipCmdList = false) => {
    if (!canSwitchCmds) {
      throw new InternalError({ message: `Tried to switch commands after regular arguments` })
    }
    activeCmd = cmdState[id]
    initialState = activeCmd.initialState
    argsState = activeCmd.argsState
    cmds = activeCmd.cmds
    opts = activeCmd.opts
    pos = activeCmd.pos

    if (!skipCmdList) {
      cmdList.push(activeCmd.name)
    }
  }

  // Start off with the root command active.
  setActiveCmd(rootCmd, true)

  while (passedArguments.length) {
    argInput = next()
    argObj = getArgumentStateObject(argInput, cmds, opts, pos, cmdState)
    argRef = argObj?.ref
    isCmd = argRef?.type === 'command'

    // If this is a command, switch to that command's context and only accept its options.
    if (isCmd) {
      setActiveCmd(argObj.id)
      continue
    }

    // If the user passed an invalid option, bail out and show an error to the end user.
    if (argObj == null) {
      throw new ParseError({ code: 'UNKNOWN_OPTION', argInput, activeCmd: activeCmd.ref })
    }

    // If this is a valid, non-command argument, extract its value and save it to the state.
    // At this point we also stop accepting commands; every non-option is now considered a positional argument.
    canSwitchCmds = false
    const type = argRef.typeData
    const typeString = type.type
    const nargs = argRef.opts.nargs
    
    const takesSingleValue = nargs === null
    const valuesAmount = takesSingleValue ? 1 : nargs
    
    if (typeString === 'boolean') {
      state[argRef.id] = argRef.opts.value
    }
    
    if (typeString === 'usage' || typeString === 'version') {
      state[argRef.id] = true
    }

    if (typeString === 'count') {
      state[argRef.id] = (state[argRef.id] + argRef.opts.value) || argRef.opts.value
    }

    // Iterate over the given values if the current argument type takes values.
    // The values are collected and added to the results as an array with length 'valueAmount',
    // except if the user's 'nargs' value is null, in which case the single value is added.
    if (type.properties.takesValues) {
      values = []

      // If this is a positional argument, we include the input itself, which will usually be the only value.
      if (!argInput.isOption) {
        values.push(argInput.content)
      }
      
      // Loop until we reach the desired number of values if 'valuesAmount' is a number,
      // or loop until we reach a non-value if it's *, + or ?.
      while ((isInteger(valuesAmount) && values.length !== valuesAmount) || (!isInteger(valuesAmount))) {
        value = next()
        if (!value) break
        if (!value.isOption) {
          values.push(value.content)
        }
        else {
          putBack(value)
          break
        }
      }

      // Check if we obtained the right number of arguments.
      if (!satisfiesNargs(values.length, valuesAmount)) {
        throw new ParseError({ code: 'INCORRECT_NUMBER_OF_VALUES', argInput, argRef, activeCmd: activeCmd.ref })
      }

      // Check if each value satisfies our type; this also runs the argument map function if specified.
      const validatedValues = validateValues(values, type)
      if (!validatedValues.isValid) {
        throw new ParseError({ code: 'INVALID_VALUE_TYPE', argInput, argRef, invalidValues: validatedValues.invalidValues, activeCmd: activeCmd.ref })
      }

      // If the user's 'nargs' option is null, save the single value rather than the array.
      state[argRef.id] = takesSingleValue ? validatedValues.values[0] : validatedValues.values
    }
  }

  return [state, initialState, cmdList, argsState]
}

/**
 * Returns the default value for an argument.
 * 
 * Normally this is the 'defaultValue' property, which is usually provided by the type,
 * but if the user has set a 'nargs' value, it should be an empty array instead.
 */
const getDefaultValue = (opts) => {
  if (opts.nargs == null) {
    return opts.defaultValue
  }
  return []
}

/**
 * Checks whether a particular number of values satisfies a particular 'nargs' value.
 * 
 * After collecting values from the command line arguments, we check the amount we found with
 * the number of values that the user expected. If the amount is incorrect, the parser will error out.
 */
const satisfiesNargs = (values, nargs) => {
  if (isInteger(nargs)) {
    return values === nargs
  }
  if (nargs === '*') {
    return true
  }
  if (nargs === '+') {
    return values > 0
  }
  if (nargs === '?') {
    return values === 0 || values === 1
  }
  throw new InternalError({ message: `Parser encountered an invalid 'nargs' value: ${nargs}` })
}

module.exports = {
  parseArguments,
  getParsedArguments,
  validateValues
}
