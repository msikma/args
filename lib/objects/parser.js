// args <https://github.com/msikma/args>
// © MIT license

const langDefault = require('../lang/default')
const Formatter = require('../help')
const { parseArguments } = require('../parser')
const { getArgumentTypeDefaults } = require('../arguments')
const { processAssets } = require('../lang/process')
const { validateParserOpts, validateFormatterOpts } = require('../validate')
const { InternalError } = require('../error')
const { getProgName, arrayWrap, exit } = require('../util')
const { ArgsCommand } = require('./command')

class ArgsParser {
  constructor(passedOpts) {
    const opts = validateParserOpts(passedOpts)
    const { prog, version, help, title, options, formatOptions, langOptions, epilogue } = opts

    // Pick the default language if none is specified.
    const lang = opts.lang ? opts.lang : langDefault

    // Validate the format and language options, and initialize the language object.
    const { formatOpts, langOpts } = validateFormatterOpts(lang, formatOptions, langOptions)
    const L = processAssets(lang.assets(langOpts))

    // The parser object is the interface that users interact with. A reference to
    // this object is passed along to the command, section and argument functions.
    this.type = 'parser'
    this.parser = this
    this.objects = []
    this.rootObjects = {}
    this.idCounter = 1
    this.settings = {
      title,
      prog: getProgName(prog),
      version,
      help: {
        values: arrayWrap(help)
      },
      epilogue: {
        values: arrayWrap(epilogue)
      },
      lang,
      langAssets: L,
      langOptions: langOpts,
      formatOptions: formatOpts,
      parserOptions: options,
      typeDefaults: getArgumentTypeDefaults(L)
    }
    this.formatter = new Formatter(this, formatOpts)

    this.addRootCommand()
  }

  parseArguments() {
    return parseArguments(this)
  }

  getCommandPath() {
    return []
  }

  getObjectTree() {
    const sections = this.getRootCommand().getObjectTree()
    return [this.getPrologueText(), ...sections, this.getEpilogueText()]
  }

  getPrologueText() {
    const object  = this.settings.help
    if (!object.values.length) return null
    return { ...object, type: 'text' }
  }

  getEpilogueText() {
    const object  = this.settings.epilogue
    if (!object.values.length) return null
    return { ...object, type: 'text' }
  }

  getArgumentHierarchy() {
    return this.getRootCommand().getArgumentHierarchy()
  }

  getArguments() {
    return this.getRootCommand().getArguments()
  }

  getCommands() {
    return this.getRootCommand().getCommands()
  }

  addArgument(...args) {
    return this.getRootCommand().addArgument(...args)
  }

  addSection(...args) {
    return this.getRootCommand().addSection(...args)
  }

  addCommand(...args) {
    return this.getRootCommand().addCommand(...args)
  }

  getRootCommand() {
    return this.rootObjects.rootCommand
  }

  addRootCommand() {
    if (this.getRootCommand()) {
      throw new InternalError({ message: 'Attempted to make a second root command' })
    }
  
    this.rootObjects.rootCommand = new ArgsCommand(this, null, {}, true)
  }

  hasOnlyRootCommand() {
    return !this.getRootCommand().hasCommands()
  }

  getArgumentID() {
    return `_${this.idCounter++}`
  }

  /**
   * Exits the program with a message.
   * 
   * Usually this is called to display the usage information when the user types --help,
   * or to display the version information after --version.
   * 
   * Errors are passed through exitWithError().
   */
  exitWithFeedback(message, exitCode = 0) {
    const { writeOut } = this.settings.parserOptions
    writeOut(message)
    return exit(exitCode)
  }

  /**
   * Exits the program with an error message.
   * 
   * This is generally called from parseArguments() after the user used incorrect arguments on the command line.
   */
  exitWithError(error, exitCode = 1) {
    const errorDetails = this.formatter.getErrorDetails(error)
    const { writeErr } = this.settings.parserOptions
  
    // Normally, 'errorDetails' is a string that we pass on to the output.
    // If an unexpected error was raised (such as a ReferenceError or some other bug in the programming),
    // we instead log the entire error for debugging purposes.
    if (errorDetails.isGenericError) {
      writeErr(`${errorDetails.details}\n`)
      writeErr(error)
      return exit(exitCode)
    }

    // If the user had selected a command prior to the error, display that command's usage information.
    const activeCmd = error.activeCmd ?? undefined
  
    const errorString = this.formatter.formatErrorString(errorDetails, activeCmd)
    writeErr(errorString)
    return exit(exitCode)
  }

  /**
   * Performs a single callback function from an argument.
   */
  runArgumentCallback({ callback, identifier, callArguments }, isSystemCallback = false) {
    if (isSystemCallback) {
      if (!callback) return null
      const result = callback.apply(null, [callArguments])
      return result
    }
    else {
      console.log('todo - regular callback')
    }
  }

  /**
   * Performs callback functions related to the arguments passed by the user.
   * 
   * Callbacks are either user-defined, or one of the special callbacks (such as --help, --version).
   */
  runArgumentCallbacks({ callbacks = [], systemCallbacks = [] }, exitOnFeedback = false) {
    if (exitOnFeedback) {
      // System callbacks take priority because they exit the program.
      for (const callback of systemCallbacks) {
        // The --help and --version arguments may have a callback that returns a custom string.
        // This is null if no callback is defined.
        const result = this.runArgumentCallback(callback, true)
  
        if (callback.identifier === 'usage') {
          const usage = result ?? this.formatHelpString()
          return this.exitWithFeedback(usage)
        }
        else if (callback.identifier === 'version') {
          const version = result ?? this.formatter.formatVersionString()
          return this.exitWithFeedback(version)
        }
        else {
          throw new InternalError({ message: `Invalid system callback specified: ${identifier}` })
        }
      }
    }
  
    for (const callback of callbacks) {
      this.runArgumentCallback(callback, false)
    }
  }

  /**
   * Returns the calling program's version number.
   * 
   * This is either defined by the user manually, or obtained from the package.json file.
   * If a version cannot be determined, a default version number of 0.0.0 is returned instead.
   */
  getProgVersion() {
    const { version } = this.settings
    if (version != null) version
  
    // TODO: get version from package
    
    return '0.0.0'
  }

  formatHelpString() {
    // TESTING
    //this.getRootCommand().rootObjects.sectionCommands.objects[0]
    return this.formatter.formatHelpString(this)
  }
}

module.exports = {
  ArgsParser
}
