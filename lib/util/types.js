// args <https://github.com/msikma/args>
// © MIT license

/** Returns true for objects (such as {} or new Object()), false otherwise. */
const isPlainObject = obj => obj != null && typeof obj == 'object' && obj.constructor == Object

/** Checks whether something is a string. */
const isString = obj => typeof obj === 'string' || obj instanceof String

/** Checks whether something is an integer. */
const isInteger = obj => Number.isInteger(obj)

/** Checks whether something is a boolean. */
const isBoolean = obj => obj === true || obj === false

/** Checks whether something is a function. */
const isFunction = obj => typeof obj === 'function'

module.exports = {
  isInteger,
  isFunction,
  isPlainObject,
  isString,
  isBoolean
}
