// args <https://github.com/msikma/args>
// © MIT license

/**
 * Calculates and returns the widths of the columns that will contain the output.
 * 
 * Arguments are printed in a table whose structure is determined by the user's options,
 * and this function determines how many columns we'll use and how large each one will be.
 * 
 * First, the header columns are the most simple:
 * 
 *     | usage: prog |   | [-p PATH] [-a] [-b] [-c] [--longer-argument] |
 *     |             |   | [--another-long-argument] [-d] [-e]          |
 * 
 * The first column is exactly as long as it needs to be, then there's a gap,
 * and the rest of the space is taken up by the maximum column width.
 * The header columns have no bearing on the rest of the columns.
 * 
 * After that, there's the commands and arguments sections. There are two basic setups:
 * either short options and long options have separate columns, or they share one column.
 * 
 * Separate columns:
 * 
 *     │ -n │ , │ --new         │ Creates a new file                    │
 *     │    │   │ --path PATH   │ Sets the path                         │
 * 
 * One shared column:
 * 
 *     │ -n, --new              │ Creates a new file                    │
 *     │ --path PATH            │ Sets the path                         │
 * 
 * Arguments are able to have values, which are displayed underneath the description
 * fields and increase the number of columns seen on the right:
 * 
 *     │ -t, --thing            │ Creates a new thing                   │
 *     │                        │   │ - fast: This is a longer text     │
 *     │                        │   │   that spans multiple lines.      │
 *     │                        │   │ - medium: This is a longer text   │
 *     │                        │   │   that spans multiple lines.      │
 * 
 * All column width values for each possible situation is calculated and returned.
 * 
 * Additionally, a few extra columns are used for formatting purposes.
 * Here's a full overview of the table:
 * 
 *                                     A
 *     ╭────────────────────────────────────────────────────────────────╮
 * 
 *          argument columns               description columns
 *     ╭───────────────────────╮ ╭──────────────────────────────────────╮
 * 
 *       B    C   D       E       F   G                  H
 *     ╭──╮ ╭──╮ ╭─╮ ╭─────────╮ ╭─╮ ╭─╮ ╭──────────────────────────────╮
 * 
 *     │   │ -t │ , │ --type    │   │ Sets the type                     │
 *     │   │    │   │           │   │   │ - bool: This is a longer text │
 *     │   │    │   │           │   │   │   that spans multiple lines.  │
 *     │   │    │   │           │   │   │ - int: This is a longer text  │
 *     │   │    │   │           │   │   │   that spans multiple lines.  │
 *     │   │    │   │ --bar     │   │ Example description               │
 * 
 *         ╰────────────────────╯
 *                    I
 * 
 *     A:    [maxWidth]
 *     B:    [argStartIndent]
 *     C:    short options column
 *     D:    width of [argSeparator]
 *     E:    long options column
 *     F:    [argDescColGap]
 *     G:    [argValueIndent]
 *     H:    text padded with [argValueDescIndent]
 *     I:    width of arguments column if using a shared options column; also commands column
 * 
 * The following configurable values are used for the calculations:
 * 
 *     maxWidth               Maximum width of the full table
 *     argStartIndent         Indent before the arguments in the left column
 *     argDescColGap          Gap in between the arguments columns and description columns
 *     argValueIndent         Indent before the values in the right column
 *     argValueDescIndent     Additional indent for subsequent lines of value descriptions
 *     argColMinimumWidth     Minimum width of the argument columns section
 *     argColMaximumWidth     Maximum width of the argument columns section
 *     argColOvershoot        Possible extra space we'll give to a particularly long argument column
 * 
 * Furthermore, the following values are important:
 * 
 *     argSeparateCols        If true, activates the separate columns design for the argument columns
 *     compactMetavars        Only prints a metavar on the last argument value; always true if 'argSeparateCols' is true
 * 
 * The calculated values are returned as an object of numbers.
 */
function calculateColumnWidths(argGroups, usageData) {
  const { maxWidthInt } = this.opts
  const useSeparateCols = this.opts.argSeparateCols
  return {
    useSeparateCols,
    colFullWidth: maxWidthInt,
    colUsage: this.calculateUsage(usageData),
    ...(useSeparateCols
      ? this.calculateSeparateCols(argGroups)
      : this.calculateSharedCols(argGroups))
  }
}

/**
 * Calculates and returns the column widths for the 'usage' section at the top.
 */
function calculateUsage(usageData) {
  const { usageColGap, maxWidthInt } = this.opts
  const usageWidth = this.stringWidth(usageData.usageProg)
  return [usageWidth, usageColGap, maxWidthInt - usageColGap - usageWidth]
}

/**
 * Calculates and returns the column widths for the "shared column" layout.
 * 
 * This is the layout in which short and long options share the same column.
 */
function calculateSharedCols(argGroups) {
  if (!argGroups) return {}
  
  const { maxWidthInt, argStartIndent, argDescColGap, argValueIndent, argColMinimumWidthInt, argColMaximumWidthInt } = this.opts
  const largestOption = getLargestOption(argGroups)
  const largestCommand = getLargestCommand(argGroups)
  const largestPositionalArgument = getLargestPositionalArgument(argGroups)
  const largestLongArgument = Math.max(largestOption, largestPositionalArgument, largestCommand)

  const argColWidth = argStartIndent + largestLongArgument
  const argColWidthLtd = Math.min(Math.max(argColMinimumWidthInt, argColWidth), argColMaximumWidthInt)

  const descColWidth = maxWidthInt - argColWidthLtd
  
  return {
    colArgs: [argStartIndent, argColWidthLtd - argStartIndent],
    colDesc: [argDescColGap, descColWidth - argDescColGap],
    colDescValue: [argDescColGap, argValueIndent, descColWidth - argDescColGap - argValueIndent]
  }
}

/**
 * Calculates and returns the column widths for the "separate column" layout.
 * 
 * This is the layout in which short and long options each have their own column.
 */
function calculateSeparateCols(argGroups) {
  if (!argGroups) return {}

  const { maxWidthInt, argStartIndent, argDescColGap, argValueIndent, argColMinimumWidthInt, argColMaximumWidthInt, argSeparatorWidth } = this.opts
  const largestShortOption = getLargestShortOption(argGroups)
  const largestLongOption = getLargestLongOption(argGroups)
  const largestCommand = getLargestCommand(argGroups)
  const largestPositionalArgument = getLargestPositionalArgument(argGroups)
  const largestLongArgument = Math.max(largestLongOption, largestPositionalArgument, largestCommand)

  // Only display the separator if we have more than zero short arguments.
  // If there are no short arguments, the display behaves the same as the shared column layout.
  const argSeparatorDisplayWidth = largestShortOption > 0 ? argSeparatorWidth : 0

  const argColWidth = argStartIndent + largestShortOption + argSeparatorDisplayWidth + largestLongArgument
  const argColWidthLtd = Math.min(Math.max(argColMinimumWidthInt, argColWidth), argColMaximumWidthInt)

  const descColWidth = maxWidthInt - argColWidthLtd
  
  return {
    colArgs: [argStartIndent, largestShortOption, argSeparatorDisplayWidth, argColWidthLtd - argSeparatorDisplayWidth - largestShortOption - argStartIndent],
    colDesc: [argDescColGap, descColWidth - argDescColGap],
    colDescValue: [argDescColGap, argValueIndent, descColWidth - argDescColGap - argValueIndent]
  }
}

/** Helper functions for getting the largest argument code of a specific type. */
const getLargestArgumentCode = (argGroupKey, key) => argGroups => Math.max(0, ...argGroups[argGroupKey].map(code => code._arg[key]))
const getLargestShortOption = getLargestArgumentCode('argOptionsShort', '_codeSummaryShortWidth')
const getLargestLongOption = getLargestArgumentCode('argOptionsLong', '_codeSummaryLongWidth')

/** Helper functions for getting the largest argument of a specific type. */
const getLargestArgument = (argGroupKey, key) => argGroups => Math.max(0, ...argGroups[argGroupKey].map(obj => obj[key]))
const getLargestOption = getLargestArgument('argOptions', '_codeSummaryWidth')
const getLargestPositionalArgument = getLargestArgument('argPositional', '_codeSummaryWidth')
const getLargestCommand = getLargestArgument('argCommands', '_contentWidth')

module.exports = {
  calculateColumnWidths,
  calculateUsage,
  calculateSeparateCols,
  calculateSharedCols
}
