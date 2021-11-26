// args <https://github.com/msikma/args>
// © MIT license

const { log } = require('../../util')

function tabulateSectionText(object, argColumns) {
  const { colFullWidth } = argColumns
  return {
    rows: object.values.map(value => [[[colFullWidth, value]]])
  }
}

module.exports = {
  tabulateSectionText
}
