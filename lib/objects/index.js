const { ArgsParser } = require('./parser')

/**
 * TODO: stub for ArgsParser() main interface which has not stabilized yet.
 */
const createParser = (passedOpts) => {
  return new ArgsParser(passedOpts)
}

module.exports = {
  createParser
}
