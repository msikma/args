// args <https://github.com/msikma/args>
// © MIT license

const { PropTypes } = require('prop-validator')

const argumentType = {
  type: 'string',
  properties: {
    takesValues: true
  },
  defaults: {
    nargs: null
  },
  defaultPropTypes: {
    nargs: PropTypes.oneOfType([PropTypes.integerRange.greaterThan(0), PropTypes.oneOf(['+'])])
  },
  validateProp: PropTypes.string
}

module.exports = argumentType
