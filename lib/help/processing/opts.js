// args <https://github.com/msikma/args>
// © MIT license

const { getTermInfo, isInteger } = require('../../util')

/**
 * Returns an integer value for the desired maximum width.
 * 
 * This will convert the width from a percentage string to a number.
 */
function getIntWidth(maxWidth) {
  const [width, type] = expandMaxWidth(maxWidth)

  if (type === '%') {
    const term = getTermInfo()
    return Math.round(term.width * (width / 100))
  }
  
  return width
}

/**
 * Returns a value multiplied by 'maxWidthInt', or returns it as-is if it's 0 or greater than 1.
 * 
 * This allows the user to use a float value, as a percentage of the maximum width,
 * or use an integer value.
 */
function getIntValue(value, maxWidthInt) {
  if (value >= 1 || value === 0) {
    return Math.floor(value)
  }
  return Math.round(value * maxWidthInt)
}

/**
 * Converts a maximum width value into an object indicating whether it's a percentage value or not.
 * 
 * The maximum width value can be either an integer (in which case it's used verbatim), or a string
 * formatted like e.g. '50%' or '80%'. A percentage value indicates that the width should be
 * a percentage of the current terminal size.
 */
function expandMaxWidth(maxWidth) {
  if (isInteger(maxWidth)) {
    return [maxWidth]
  }
  // Check if maxWidth is a valid string value.
  const matches = maxWidth.match(/^([0-9]+)(.)$/)
  if (matches == null) return []
  if (matches[2] !== '%') return []
  const intValue = Number(matches[1])
  return [intValue, '%']
}

/**
 * Processes the given format options for use by the help formatter.
 */
function processFormatOpts(formatOpts) {
  const { L } = this

  // Determine the exact width (if the user's requested width is dependent on the terminal size).
  formatOpts.maxWidthInt = getIntWidth(formatOpts.maxWidth)

  // Convert potential float values to int.
  formatOpts.argColMinimumWidthInt = getIntValue(formatOpts.argColMinimumWidth, formatOpts.maxWidthInt)
  formatOpts.argColMaximumWidthInt = getIntValue(formatOpts.argColMaximumWidth, formatOpts.maxWidthInt)
  formatOpts.argColOvershootInt = getIntValue(formatOpts.argColOvershoot, formatOpts.maxWidthInt)

  formatOpts.argSeparatorWidth = this.stringWidth(L.argSeparator)
  formatOpts.useAbbreviatedError = this.parser.settings.formatOptions.useAbbreviatedError

  return formatOpts
}

module.exports = {
  processFormatOpts
}
