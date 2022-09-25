// args <https://github.com/msikma/args>
// © MIT license

const format = require('./format')
const processing = require('./processing')
const merge = require('./merge')
const tabulate = require('./tabulate')
const util = require('./util')

class Formatter {
  constructor(parser, passedOpts = {}) {
    this.parser = parser
    this.opts = passedOpts
    this.L = parser.settings.langAssets

    // Modify passed formatting options; turns percentage values into absolute values and does string preprocessing.
    this.opts = this.processFormatOpts(passedOpts)
  }

  /**
   * Produces an abbreviated help message in case the user gives invalid input.
   * 
   * This is what's shown just before the program exits.
   */
  formatErrorString(errorString, activeCmd, abbreviate = this.opts.useAbbreviatedError, includeMeta = false) {
    const errorLine = this.formatError(errorString)
    return this.formatHelpString(activeCmd, abbreviate, includeMeta, [errorLine])
  }

  /**
   * Produces a string indicating the program's version.
   * 
   * This is the text displayed when the user passes the -v or --version argument.
   * 
   * If the user does not set the version manually, it is determined from their package.json instead.
   */
  formatVersionString() {
    const usageData = this.formatUsage(this.parser)
    const progVersion = this.parser.getProgVersion()
    return `${usageData.prog} ${progVersion}`
  }

  /**
   * Produces the help text for a parser.
   * 
   * This is the text displayed when the user passes the -h or --help argument.
   * 
   * If abbreviate is true, only the top usage section will be displayed, and subsequent
   * arguments and their descriptions are not included. This is used for displaying errors,
   * or for when the user sends no input at all.
   * 
   * If includeMeta is true, some information about the generated string is included for debugging.
   * 
   * Finally, suffixLines is used to add additional lines of text to the end of the formatted string.
   * This is used to include an error message for invalid arguments on the command line.
   */
  formatHelpString(rootObject = this.parser, abbreviate = false, includeMeta = false, suffixLines = []) {
    // Generate usage header string; title, usage and accepted arguments.
    const usageData = this.formatUsage(rootObject)

    // If displaying an abbreviated help string, just format the usage section only and return it.
    if (abbreviate) {
      const usageColumns  = this.calculateColumnWidths(null, usageData)
      const usageTable = this.tabulateUsage(usageData, usageColumns)
      const suffixTable = this.tabulateSectionText({ values: suffixLines }, usageColumns)
      const merged = this.mergeTable([...usageTable.rows, ...suffixTable.rows])
      return this.wrapReturnValue(merged, {}, usageColumns, includeMeta)
    }

    // Preprocess our arguments (mainly the left column, as that one is important for the column sizes).
    // This also separates the arguments and groups them by type.
    const argGroups = this.getProcessedArgGroups(rootObject)
    
    // Calculate the sizes of the columns. See <processing/columns.js> for an explanation.
    const argColumns  = this.calculateColumnWidths(argGroups, usageData)

    // Generate the table rows we'll display.
    const usageTable = this.tabulateUsage(usageData, argColumns)
    const objectTable = this.tabulateObjectTree(rootObject, argGroups, argColumns)
    const suffixTable = this.tabulateSectionText({ values: suffixLines }, argColumns)

    // Merge everything together into a string.
    const merged = this.mergeTable([...usageTable.rows, ...objectTable.rows, ...suffixTable.rows])

    // In some cases (mostly testing) we might want to return some additional information.
    return this.wrapReturnValue(merged, objectTable.meta, argColumns, includeMeta)
  }

  /**
   * Wraps the return value of the help formatter, either returning it as-is or as an object with metadata.
   */
  wrapReturnValue(helpString, objectMeta, colMeta, includeMeta) {
    if (!includeMeta) {
      return helpString
    }
    const { useVisualWidth } = this.opts
    return { helpString, ...objectMeta, useVisualWidth, ...colMeta }
  }
}

// TODO: maybe there's a nicer way to integrate these components:

// The process of formatting feedback to the user happens in several steps:
// 1. the actual formatting of internal objects into individual output strings,
Object.assign(Formatter.prototype, format)
// 2. calculating how to best fit all these strings into a composited whole,
Object.assign(Formatter.prototype, processing)
// 3. generating a table object and fitting the strings into the appropriate columns/rows,
Object.assign(Formatter.prototype, tabulate)
// 4. merging the table object into an output string.
Object.assign(Formatter.prototype, merge)

// Helper utilities; contains string wrapping and string width (for CJK wide character support) functions
// and error handling code, e.g. for when a user fails to pass a required argument, or passes an invalid argument.
Object.assign(Formatter.prototype, util)

module.exports = {
  Formatter
}
