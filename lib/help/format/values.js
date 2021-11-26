// args <https://github.com/msikma/args>
// © MIT license

/**
 * Formats a value.
 */
function formatValue(value) {
  const { L } = this
  return L.argValueCode(value.content, value.opts.description)
}

module.exports = {
  formatValue
}
