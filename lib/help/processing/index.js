// args <https://github.com/msikma/args>
// © MIT license

const args = require('./args')
const columns = require('./columns')
const opts = require('./opts')

module.exports = {
  ...args,
  ...columns,
  ...opts
}
