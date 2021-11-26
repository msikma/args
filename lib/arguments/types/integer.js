// args <https://github.com/msikma/args>
// © MIT license

const { PropTypes } = require('prop-validator')

const argumentType = {
  type: 'integer',
  properties: {
    takesValues: true
  },
  defaults: {
    defaultValue: 0,
    nargs: null
  },
  defaultPropTypes: {
    nargs: PropTypes.oneOfType([PropTypes.integerRange.greaterThan(0), PropTypes.oneOf(['+'])])
  },
  mapProp: value => parseInt(value, 10),
  validateProp: PropTypes.integer
}

module.exports = argumentType
