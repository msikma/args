// args <https://github.com/msikma/args>
// © MIT license

function tabulateSectionHeader(object, argColumns) {
  const { colFullWidth } = argColumns
  return {
    rows: [[colFullWidth, object.title]]
  }
}

module.exports = {
  tabulateSectionHeader
}
