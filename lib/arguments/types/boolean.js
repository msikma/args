// args <https://github.com/msikma/args>
// © MIT license

const { PropTypes } = require('prop-validator')

/**
 * Boolean argument
 * 
 * The most basic type, and the default for arguments that do not specify a type.
 * 
 *   prog --argument    { argument: true }
 *   prog               { argument: false }
 */
const argumentType = {
  type: 'boolean',
  properties: {
    takesValues: false
  },
  defaults: {
    value: true,
    defaultValue: false
  },
  defaultPropTypes: {
    nargs: PropTypes.null
  },
  validate: null
}

module.exports = argumentType
