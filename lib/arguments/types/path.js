// args <https://github.com/msikma/args>
// © MIT license

const { PropTypes } = require('prop-validator')

const argumentType = {
  type: 'path',
  properties: {},
  defaults: L => ({
    metavar: L.metavarPath,
    nargs: 1
  }),
  defaultPropTypes: {
    nargs: PropTypes.oneOfType([PropTypes.integerRange.greaterThan(0), PropTypes.oneOf(['+'])])
  },
  validate: () => {
    console.log('todo validate path')
  }
}

module.exports = argumentType
