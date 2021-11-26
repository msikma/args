// args <https://github.com/msikma/args>
// © MIT license

const { PropTypes } = require('prop-validator')

/**
 * Version argument
 * 
 * Special argument type that displays the program version.
 */
const argumentType = {
  type: 'version',
  properties: {
    takesValues: false,
    systemCallback: 'version'
  },
  defaults: {
  },
  defaultPropTypes: {
    nargs: PropTypes.null
  }
}

module.exports = argumentType
