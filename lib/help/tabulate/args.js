// args <https://github.com/msikma/args>
// © MIT license

const { arrayProduct } = require('../../util')

/**
 * Checks whether an argument is too long to fit both its argument summary and description on one row.
 * 
 * If possible, an argument has just one row; if the argument column content is too long,
 * the description column content will be pushed to a new line.
 */
function hasArgumentOverflow(arg, argColumns) {
  const { useSeparateCols, colArgs } = argColumns
  let contentWidth, colWidth

  if (useSeparateCols) {
    // For separate columns, the long option column is checked for overflow.
    contentWidth = arg._codeSummaryLongWidth
    colWidth = colArgs[3]
  }
  else {
    // For a shared column, the full code summary (short and long) is used.
    contentWidth = arg._codeSummaryWidth
    colWidth = colArgs[1]
  }

  return contentWidth > colWidth
}

/**
 * Turns a command argument into a set of rows to print.
 */
function tabulateCommandItem(arg, argColumns) {
  const { colArgs, colDesc } = argColumns

  const meta = {
    isOversizedArgument: false
  }
  const rows = []

  // Amount of space; either one or several columns, depending on argColumns.useSeparateCols.
  const colArgSpace = arrayProduct(colArgs.slice(1))

  const cols = []
  cols.push([colArgs[0], ''])
  cols.push([colArgSpace, arg.content])
  cols.push([colDesc[0], ''])
  cols.push([colDesc[1], arg.opts.description])
  rows.push(cols)

  return {
    ...meta,
    rows
  }
}

/**
 * Returns the tabulated data for the values of an argument.
 * 
 * Called by tabulateArgumentItem() and tabulateArgumentItemOverflow().
 */
function tabulateArgumentValues(arg, argColumns) {
  const { argValueDescIndent } = this.opts
  const { colArgs, colDescValue } = argColumns

  const rows = []

  // Product of all column arguments; used as offset for the values.
  const colArgsProduct = arrayProduct(colArgs)

  // Add rows for each value.
  for (const value of arg.objects) {
    const cols = []
    cols.push([colArgsProduct + colDescValue[0] + colDescValue[1], ''])
    cols.push([colDescValue[2], value._valueSummary, argValueDescIndent])
    rows.push(cols)
  }
  
  return rows
}

/**
 * Returns the tabulated data for a single argument item with overflow.
 * 
 * This is for arguments whose leftmost column content is too large to fit,
 * so we move the rightmost content down.
 */
function tabulateArgumentItemOverflow(arg, argColumns) {
  const { L } = this
  const { useSeparateCols, colArgs, colDesc } = argColumns

  const rows = []
  let cols

  // Product of the columns that contain the argument summary.
  // Since this argument summary is very long, it's using the description columns too.
  const colArgsProduct = arrayProduct([...colArgs.slice(-1), ...colDesc])

  // How we add the argument item depends on the column layout.
  // If we have separate columns, then the short/long options must be put into their respective columns.
  if (useSeparateCols) {
    // Row 1: the argument summary.
    cols = []
    cols.push([colArgs[0], ''])
    cols.push([colArgs[1], arg._codeSummaryShort])
    cols.push([colArgs[2], arg._codeSummaryIsSplit ? L.argSeparator : ''])
    cols.push([colArgsProduct, arg._codeSummaryLong])
    rows.push(cols)

    // Row 2: the description.
    cols = []
    cols.push([colArgs[0], ''])
    cols.push([colArgs[1], ''])
    cols.push([colArgs[2], ''])
    cols.push([colArgs[3], ''])
    cols.push([colDesc[0], ''])
    cols.push([colDesc[1], arg.opts.description])
    rows.push(cols)
  }
  // If we use a shared column for short/long options, use the combined string.
  else {
    // Row 1: the argument summary.
    cols = []
    cols.push([colArgs[0], ''])
    cols.push([colArgsProduct, arg._codeSummary])
    rows.push(cols)

    // Row 2: the description.
    cols = []
    cols.push([colArgs[0], ''])
    cols.push([colArgs[1], ''])
    cols.push([colDesc[0], ''])
    cols.push([colDesc[1], arg.opts.description])
    rows.push(cols)
  }

  // Add any values that might be part of this argument.
  const values = this.tabulateArgumentValues(arg, argColumns)
  
  return {
    isOversizedArgument: true,
    rows: [...rows, ...values]
  }
}

/**
 * Returns the tabulated data for a single argument item.
 */
function tabulateArgumentItem(arg, argColumns) {
  const { L } = this
  const { useSeparateCols, colArgs, colDesc } = argColumns

  const rows = []
  let cols

  // How we add the argument item depends on the column layout.
  // If we have separate columns, then the short/long options must be put into their respective columns.
  if (useSeparateCols) {
    cols = []
    cols.push([colArgs[0], ''])
    cols.push([colArgs[1], arg._codeSummaryShort])
    cols.push([colArgs[2], arg._codeSummaryIsSplit ? L.argSeparator : ''])
    cols.push([colArgs[3], arg._codeSummaryLong])
    cols.push([colDesc[0], ''])
    cols.push([colDesc[1], arg.opts.description])
    rows.push(cols)
  }
  // If we use a shared column for short/long options, use the combined string.
  else {
    cols = []
    cols.push([colArgs[0], ''])
    cols.push([colArgs[1], arg._codeSummary])
    cols.push([colDesc[0], ''])
    cols.push([colDesc[1], arg.opts.description])
    rows.push(cols)
  }

  // Add any values that might be part of this argument.
  const valueRows = this.tabulateArgumentValues(arg, argColumns)
  
  return {
    isOversizedArgument: false,
    rows: [...rows, ...valueRows]
  }
}

/**
 * Tabulates any child item of a section; either arguments (positional or optional) or commands.
 * 
 * This checks what type of object is being passed and then calls one of the above functions.
 */
function tabulateSectionChild(arg, argColumns, argType) {
  if (argType === 'arguments') {
    if (arg.type === 'argument') {
      if (hasArgumentOverflow(arg, argColumns)) {
        return this.tabulateArgumentItemOverflow(arg, argColumns, argType)
      }
      else {
        return this.tabulateArgumentItem(arg, argColumns, argType)
      }
    }
    if (arg.type === 'command') {
      return this.tabulateCommandItem(arg, argColumns, argType)
    }
  }
  throw new Error(`Attempted to tabulate an unknown item type: ${argType}`)
}

module.exports = {
  tabulateArgumentItemOverflow,
  tabulateArgumentItem,
  tabulateArgumentValues,
  tabulateCommandItem,
  tabulateSectionChild
}
