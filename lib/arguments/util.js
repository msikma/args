// args <https://github.com/msikma/args>
// © MIT license

const { isFunction } = require('../util')

/**
 * Returns the default values (props or proptypes) for a given argument.
 */
const getDefaults = (context, argType, argDefaults, globalDefaults) => {
  const values = isFunction(argDefaults)
    ? argDefaults(...(context || []))
    : argDefaults
  return {
    ...globalDefaults,
    ...values,
    type: argType
  }
}

module.exports = {
  getDefaults
}
