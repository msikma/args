// args <https://github.com/msikma/args>
// © MIT license

const { PropTypes } = require('prop-validator')

/**
 * Usage argument
 * 
 * Special argument type that displays the usage information.
 */
const argumentType = {
  type: 'usage',
  properties: {
    takesValues: false,
    systemCallback: 'usage'
  },
  defaults: {
  },
  defaultPropTypes: {
    nargs: PropTypes.null
  }
}

module.exports = argumentType
