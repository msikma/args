// args <https://github.com/msikma/args>
// © MIT license

const args = require('./args')
const header = require('./header')
const text = require('./text')
const tree = require('./tree')
const usage = require('./usage')

module.exports = {
  ...args,
  ...header,
  ...text,
  ...tree,
  ...usage
}
