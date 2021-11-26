// args <https://github.com/msikma/args>
// © MIT license

const exportsData = require('./data')
const exportsFormatting = require('./formatting')
const exportsLog = require('./log')
const exportsTerm = require('./term')
const exportsTypes = require('./types')

module.exports = {
  ...exportsData,
  ...exportsFormatting,
  ...exportsLog,
  ...exportsTerm,
  ...exportsTypes,
}
