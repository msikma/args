// args <https://github.com/msikma/args>
// © MIT license

const { genericAssets, genericOpts } = require('../generic')

const langEng = {
  code: 'en-US',
  name: 'English (US)',
  opts: {
    ...genericOpts
  },
  assets: langOpts => ({
    ...genericAssets,

    /** Default metavar for the 'path' argument type. */
    metavarPath: 'PATH',

    /** Default terms for the commands and arguments sections. */
    headerCommands: 'Commands:',
    headerOptionalArguments: 'Optional arguments:',
    headerPositionalArguments: 'Positional arguments:',
    argumentHelp: ['-h', '--help'],
    argumentHelpDesc: 'Show this help message and exit.',
    argumentVersion: ['-v', '--version'],
    argumentVersionDesc: `Show program's version number and exit.`,

    /** Error handlers. */
    errorUnknownOptionalArgument: ({ argInput }) => `Unrecognized arguments: ${argInput.originalValue}`,
    errorUnknownPositionalArgument: ({ argInput }) => `Unrecognized arguments: ${argInput.originalValue}`,
    errorIncorrectNumberOfValues: ({ argInput, argRef }) => `Argument ${argInput.originalValue}: ${
      Number.isInteger(argRef.opts.nargs) ? `expected ${argRef.opts.nargs} argument${argRef.opts.nargs !== 1 ? 's' : ''}` :
      argRef.opts.nargs === '+' ? `expected 1 or more arguments` :
      argRef.opts.nargs === '?' ? `expected 1 or 0 arguments` : `unknown`}`,
    errorInvalidValueType: ({ argInput, argRef, invalidValues }) => `Argument ${argInput.originalValue}: invalid ${argRef.typeData.type} value: ${invalidValues.map(value => value.originalValue)}`,
    errorInvalidValueOption: ({ argInput, argRef, invalidValues, acceptedValues }) => `Argument ${argInput.originalValue}: value must be one of ${genericAssets.joinSet(acceptedValues)}: ${invalidValues.map(value => value.originalValue)}`,
    // TODO: add debug version
    errorFallback: error => `An error occurred while parsing arguments: ${error.code || error.name || error.toString()}`,
    errorFallbackGeneric: error => `A fatal internal error occurred:`,
    errorMissingArguments: ({ argsMissing }) => `The following arguments are required: ${genericAssets.joinArgs(argsMissing.map(arg => arg.ref.argSummary))}`,

    /** The 'usage' indicator at the top. */
    progUsage: (name, cmd = []) => `usage: ${name}${cmd.length ? ` ${cmd.join(' ')}` : ''}`,

    /** An error string for when the user passes invalid input. */
    progError: (name, reason) => `${name}: error: ${reason}.`
  })
}

module.exports = langEng
