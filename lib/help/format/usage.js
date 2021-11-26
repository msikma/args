// args <https://github.com/msikma/args>
// © MIT license

const { toNonBreaking } = require('../../util/formatting')

/**
 * Returns a string of all usable arguments and their metavars, for display at the top.
 */
function formatUsageArgs(rootObject) {
  const { L } = this
  const parserArgs = rootObject.getArguments()
  const formattedArguments = []
  for (const arg of parserArgs) {
    const list = L.joinArgs(this.formatArg(arg, true, [0]))
    formattedArguments.push(toNonBreaking(arg.opts.required ? list : L.argOptionalBrackets(list)))
  }
  return L.joinMetavars(formattedArguments)
}

/**
 * Prepares the header for the help display.
 * 
 * This is the section that's printed at the top of the help information and includes the 'usage' string.
 * If a title is set, the title will
 * TODO: asdf
 * 
 * Example output:
 * 
 *     usage: TODO [asdf]
 */
function formatUsage(rootObject) {
  const { L } = this
  const { prog, title } = this.parser.settings

  const usageArgs = this.formatUsageArgs(rootObject)
  const usageCommandPath = rootObject.getCommandPath()
  const usageProg = L.progUsage(prog, usageCommandPath.reverse())

  return {
    title: title ? `${title}\n` : '',
    prog,
    usageProg,
    usageArgs
  }
}

/**
 * Returns an error string for invalid input.
 * 
 * This is displayed at the bottom of an error string if the user passes invalid input on the command line.
 */
function formatError(reason) {
  const { L } = this
  const { prog } = this.parser.settings
  return L.progError(prog, reason)
}

module.exports = {
  formatError,
  formatUsage,
  formatUsageArgs
}
