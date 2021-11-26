// args <https://github.com/msikma/args>
// © MIT license

const util = require('util')
const process = require('process')
const { isString } = require('./types')
const { getProgName } = require('./term')

// Default logging options.
const logDepth = 6
const logMaxLength = null

/** Logs multiple items; as console.log(), but with our own util.inspect() version. */
const log = (...objs) => {
  const objStrings = objs.map(obj => {
    // Note: strings are returned verbatim since getting the extra quotes are unneeded in most cases.
    if (isString(obj)) {
      return obj
    }
    return inspectObject(obj)
  })
  console.log(objStrings.join(' '))
}

/** Runs inspectObject() on multiple items. */
const inspect = (...objs) => {
  return objs.map(obj => inspectObject(obj))
}

/** Returns a dump of the contents of an object. */
const inspectObject = (obj, opts = {}) => {
  return util.inspect(obj, { colors: true, depth: logDepth, maxArrayLength: logMaxLength, breakLength: 120, ...opts })
}

/** Exits the program with a return code. */
const exit = exitCode => {
  process.exit(exitCode)
}

/** Exits the program with an error. */
const die = (...objs) => {
  if (objs.length) {
    log(`${getProgName()}:`, ...segments)
  }
  process.exit(1)
}

module.exports = {
  log,
  die,
  exit,
  inspect,
  inspectObject
}
