// args <https://github.com/msikma/args>
// © MIT license

const { PropTypes } = require('prop-validator')

const boolean = require('./boolean')
const count = require('./count')
const integer = require('./integer')
const path = require('./path')
const string = require('./string')
const usage = require('./usage')
const version = require('./version')

const argumentTypes = [boolean, count, integer, path, string, usage, version]

module.exports = {
  argumentMap: Object.fromEntries(argumentTypes.map(t => [t.type, t])),
  argumentTypes,
  globalDefaultProperties: {
    takesValues: true
  },
  globalDefaultPropTypes: {
    description: PropTypes.string,
    type: PropTypes.oneOf(argumentTypes.map(arg => arg.type)),
    callback: PropTypes.func,
    metavar: PropTypes.oneOfType([PropTypes.string, PropTypes.arrayOf(PropTypes.string)]),
    nargs: PropTypes.oneOfType([PropTypes.integer, PropTypes.stringMatching(/^[*+?]$/)]),
    required: PropTypes.bool,
    priority: PropTypes.number
  },
  globalDefaultsPositional: {
    required: true
  },
  globalDefaults: {
    description: null,
    value: null,
    defaultValue: null,
    callback: null,
    metavar: undefined,
    nargs: null,
    required: false,
    priority: 1000
  },
  defaultTypePositional: 'string',
  defaultType: 'boolean'
}
