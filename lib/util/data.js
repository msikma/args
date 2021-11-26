// args <https://github.com/msikma/args>
// © MIT license

const { isPlainObject } = require('./types')

/** Wraps anything in an array if it isn't one already. */
const arrayWrap = obj => Array.isArray(obj) ? obj : [obj]

/** Adds up an array of all integers. */
const arrayProduct = arr => arr.reduce((total, value) => total + value, 0)

/** Maps an array to an object by a specific key. */
const objectKeyMap = (arr, key) => arr.reduce((obj, item) => ({ ...obj, [item[key]]: item }), {})

/**
 * Performs a deep merge of multiple objects.
 */
const mergeDeep = (...objects) => {
  return objects.reduce((prev, curr) => {
    Object.keys(curr).forEach(key => {
      const prevValue = prev[key]
      const currValue = curr[key]
      
      if (Array.isArray(prevValue) && Array.isArray(currValue)) {
        prev[key] = prevValue.concat(...currValue)
      }
      else if (isPlainObject(prevValue) && isPlainObject(currValue)) {
        prev[key] = mergeDeep(prevValue, currValue)
      }
      else {
        prev[key] = currValue
      }
    })
    
    return prev
  }, {})
}

/** Removes falsy values from an object. */
const omitFalsyValues = obj => Object.fromEntries(Object.entries(obj).filter(([k, v]) => v))

/** Removes falsy items from an array. */
const omitFalsy = arr => arr.filter(n => n)

module.exports = {
  arrayWrap,
  arrayProduct,
  mergeDeep,
  objectKeyMap,
  omitFalsy,
  omitFalsyValues
}
