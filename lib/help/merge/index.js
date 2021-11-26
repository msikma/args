// args <https://github.com/msikma/args>
// © MIT license

/**
 * Merges a list of columns together into one string.
 * 
 * The 'columns' array contains arrays with two items: a string, and the width of the column.
 * For example, ['this is word wrapped to 40 characters', 40] - the string is already wrapped at this point.
 * 
 * Returns a string of the columns merged into a single row.
 */
function mergeColumns(columns) {
  const lines = []
  const colLines = columns.map(col => [col[0].split('\n'), col[1]])
  const colLongest = Math.max(0, ...colLines.map(col => col[0].length))

  for (let a = 0; a < colLongest; ++a) {
    const line = []
    for (let b = 0; b < colLines.length; ++b) {
      line.push(colLines[b][0][a] ? colLines[b][0][a] : ' '.repeat(colLines[b][1]))
    }
    lines.push(line.join(''))
  }
  
  return lines.join('\n')
}

/**
 * Merges a collection of table rows together into a string.
 * 
 * This finalizes the argument parser's help formatting. Items are divided into "row groups"
 * which are clustered together and separated by a linebreak, and inside these row groups
 * are individual rows and columns. The columns are passed to mergeColumns(), which produces
 * a single string for a single row, which are then pushed to the output stack.
 * 
 * Returns a string of the finalized help output.
 */
function mergeTable(tableRowGroups) {
  const sections = []
  for (const rowGroup of tableRowGroups) {
    const group = []
    for (const row of rowGroup) {
      const rowCols = []
      for (const col of row) {
        const [width, content, subIndent] = col
        const wrapped = this.stringWrap(content, width, subIndent)
        rowCols.push([wrapped, width])
      }
      group.push(this.mergeColumns(rowCols))
    }
    sections.push(group.join('\n'))
  }
  return sections.join('\n\n')
}

module.exports = {
  mergeTable,
  mergeColumns
}
