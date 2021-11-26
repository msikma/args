// args <https://github.com/msikma/args>
// © MIT license

const { PropTypes } = require('prop-validator')

/**
 * Count argument
 * 
 * An integer counter that increments on every instance. Best used with a short argument.
 * A common use for this is -v or -V to set verbosity. Count arguments do not take
 * any values.
 * 
 *   prog -v                   { verbose: 1 }
 *   prog -vv                  { verbose: 2 }
 *   prog -vvv                 { verbose: 3 }
 *   prog -v -v -v             { verbose: 3 }
 *   prog -v -vv               { verbose: 3 }
 *   prog --verbose            { verbose: 1 }
 *   prog --verbose --verbose  { verbose: 2 }
 *   prog                      { verbose: 0 }
 */
const argumentType = {
  type: 'count',
  properties: {
    takesValues: false
  },
  defaults: {
    defaultValue: 0,
    value: 1
  },
  defaultPropTypes: {
    nargs: PropTypes.oneOf([0]),
    defaultValue: PropTypes.number,
    value: PropTypes.number
  },
  validate: null
}

module.exports = argumentType
