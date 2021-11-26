// args <https://github.com/msikma/args>
// © MIT license

const { parseArgument } = require('cmd-tokenize').util
const { getArgumentTypeData } = require('../arguments')
const { validateArgumentOpts, validateArgumentCodes } = require('../validate')
const { ValidationError, InternalError } = require('../error')
const { arrayWrap } = require('../util')
const { ArgsValue } = require('./value')

class ArgsArgument {
  constructor(parent, argCode, passedOpts = {}) {
    const argCodes = validateArgumentCodes(argCode)

    // Whether long or short codes are preferred in the argument summary.
    const { preferLongCodes, preferShortCodes } = parent.parser.settings.formatOptions

    // The "argument codes" are the actual strings the user types in, such as '-a', or '--asdf'.
    // Here we run parserArgument() on each code to find out what type it is.
    const codes = argCodes.map(code => code.trim()).map(argCode => {
      // We always expect every argument code to be length 1 when parsed. If 'useSingleDashOptions'
      // is set to true (the default), we expect every short option to be only one character in size,
      // e.g. -a or -b. If the user passes -ab, this is invalid, as it expands to two distinct codes.
      // If 'useSingleDashOptions' is false, these become valid; and conversely, long options become invalid.
      //
      // Long story short: either we allow "-ab --long" expanding to ['-a', '-b', '--long'], or we
      // allow "-ab" expending to ['-ab'] with "--long" being an invalid option.
      const { useSingleDashOptions } = parent.parser.settings.parserOptions
      const argCodeDetails = parseArgument(argCode, { unpackCombinedOptions: !useSingleDashOptions })
      if (argCodeDetails.length > 1) {
        throw new ValidationError({ message: `Argument code is invalid (expanded to multiple arguments): ${argCode}` })
      }
      if (useSingleDashOptions && argCodeDetails[0].isLongOption) {
        throw new ValidationError({ message: `Long options are invalid when 'useSingleDashOptions' is true: ${argCode}` })
      }

      // TODO: does code.opts do anything?
      return {
        content: argCode,
        type: 'code',
        opts: {},
        details: argCodeDetails[0]
      }
    })

    // TODO: verify that ALL codes are either options, or all not options.

    // Picks one of the codes to use for generating metavars and other things.
    const primaryCode = getPrimaryCode(codes, preferLongCodes, preferShortCodes)

    // Whether this argument is positional or optional; this alters which default options we give it.
    const isOption = !!codes.find(arg => arg.details.isOption)

    // Now that we know whether this is a positional argument or an optional argument,
    // validate the options and merge in the defaults.
    const opts = validateArgumentOpts(passedOpts, parent.parser, { isOption })
    const typeData = getArgumentTypeData(opts.type)
    
    // Check whether this argument requires one or more metavars. These will be specified
    // by the user, or it will be the original argument in all caps if unspecified.
    const metavars = getMetavars(primaryCode, opts)

    // Key name for the result object; this is where the user's provided value will go.
    // This is checked for duplicates when adding the argument to the parser;
    // if it's already in use, an error is thrown.
    const key = getArgumentKey(codes, opts)

    this.parser = parent.parser
    this.type = 'argument'
    this.id = this.parser.getArgumentID()
    this.key = key
    this.codes = codes
    this.argSummary = primaryCode?.content
    this.isOption = isOption
    this.opts = opts
    this.typeData = typeData
    this.metavars = metavars
    this.objects = []
  }

  addValue(value, opts) {
    const object = new ArgsValue(this, value, opts)
    this.objects.push(object)
    return object
  }
}

/** Returns the "main" code that we'll use to display help text. */
const getPrimaryCode = (codes, preferLongCodes = false, preferShortCodes = false) => {
  const shortCode = codes.find(code => code.details.isOption && !code.details.isLongOption)
  const longCode = codes.find(code => code.details.isLongOption)
  const positionalCode = codes.find(code => !code.details.isOption)

  if (positionalCode) {
    return positionalCode
  }
  if (preferLongCodes || (!preferLongCodes && !preferShortCodes)) {
    return longCode || shortCode
  }
  if (preferShortCodes) {
    return shortCode || longCode
  }

  // If no preference is stated, return the first item specified.
  return codes[0]
}

/** Creates a metavar object out of a string. */
const makeMetavar = code => {
  return {
    content: code,
    type: 'metavar'
  }
}

/** Returns one or more metavars if needed. Otherwise returns an empty array. */
const getMetavars = (argCode, opts) => {
  // Return the user specified metavar if it's there.
  // Note that 'null' is a valid value for the metavar, causing it to not display one.
  if (opts.metavar !== undefined) {
    return arrayWrap(opts.metavar).map(code => makeMetavar(code))
  }

  return [makeMetavar(argCode.details.content.toUpperCase())]
}

/** Returns the key value used to save the user's provided input. */
const getArgumentKey = (argCodes, opts) => {
  // User the user's provided key verbatim if passed.
  if (opts.key) {
    return opts.key.trim()
  }

  // If this argument has a long code, use that; or if this is a positional argument, just use the first.
  const preferredCode = argCodes.find(code => code.details.isLongOption || code.details.isOption === false) ?? argCodes[0]

  if (preferredCode == null) {
    throw new InternalError({ message: `Could not infer argument key: ${argCodes.map(code => code.content)}` })
  }

  return preferredCode.details.content
}

module.exports = {
  ArgsArgument
}
