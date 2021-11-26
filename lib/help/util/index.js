// args <https://github.com/msikma/args>
// © MIT license

const string = require('./string')
const error = require('./error')

module.exports = {
  ...string,
  ...error
}
