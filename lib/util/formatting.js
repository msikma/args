// args <https://github.com/msikma/args>
// © MIT license

/**
 * Converts all spaces in a string to non-breaking spaces.
 */
const toNonBreaking = str => {
  return str.replace(/ /g, '\u00a0')
}

module.exports = {
  toNonBreaking
}
