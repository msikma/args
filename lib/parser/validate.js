// args <https://github.com/msikma/args>
// © MIT license

const { validateProps } = require('prop-validator')

/** No-op for value types with no 'mapProp' function. */
const mapNoop = value => value

/** No-op for value types with no validation. */
const validateNoop = () => true

/**
 * Validates an array of values according to a type's requirements.
 * 
 * This will also run the type's transform function if one is specified.
 * This is used, for example, to convert the 'integer' type's values from strings to numbers.
 */
const validateValues = (values, type) => {
  const { validateProp, validate, mapProp } = type

  // Values get passed through a function that transforms them, if necessary.
  // If none is set, it's passed through as-is.
  const mapValue = mapProp
    ? mapProp
    : mapNoop
  
  // Values are validated either by a 'validate' function, or a 'validateProp' PropType.
  const validateValue = validateProp
    ? value => validateProps(validateProp, value).isValid
    : validate || validateNoop
  
  const validationResult = values.map(originalValue => {
    const value = mapValue(originalValue)
    return { value, originalValue, isValid: validateValue(value) }
  })

  return {
    isValid: !validationResult.map(value => value.isValid).includes(false),
    invalidValues: validationResult.filter(value => !value.isValid),
    valueData: validationResult,
    values: validationResult.map(value => value.value)
  }
}

module.exports = {
  validateValues
}
