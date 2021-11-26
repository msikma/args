// args <https://github.com/msikma/args>
// © MIT license

const { getDefaults } = require('./util')
const types = require('./types')

/** All valid, existing argument types. */
const validArgumentTypes = types.argumentTypes.map(arg => arg.type)

/** All arguments have this type by default, if not otherwise specified. */
const defaultArgumentType = types.defaultType
const defaultArgumentTypePositional = types.defaultTypePositional

/** Returns the special properties for this argument type, e.g. whether it supports adding values. */
const getArgumentProperties = type => {
  return { ...types.globalDefaultProperties, ...(types.argumentMap[type].properties ?? {}) }
}

/** Returns the type data for a specific argument type. */
const getArgumentTypeData = type => {
  return {
    ...types.argumentMap[type],
    properties: { ...types.globalDefaultProperties, ...(types.argumentMap[type].properties ?? {}) }
  }
}

/** Returns the default values for all types. */
const getArgumentTypeDefaults = L => {
  return Object.fromEntries(types.argumentTypes.map(arg => {
    return [arg.type, getDefaults([L], arg.type, arg.defaults, types.globalDefaults)]
  }))
}

/**
 * PropTypes for specific argument types.
 * 
 * Note: there's a separate proptypes object on the argument object,
 * which is extended by the type-specific proptypes object.
 * 
 * See ../objects/argument.js for details.
 */
const defaultArgumentPropTypes = Object.fromEntries(types.argumentTypes.map(arg => {
  return [arg.type, arg.defaultPropTypes]
}))

module.exports = {
  globalArgumentDefaults: types.globalDefaults,
  globalArgumentDefaultsPositional: types.globalDefaultsPositional,
  globalArgumentDefaultPropTypes: types.globalDefaultPropTypes,
  defaultArgumentType,
  defaultArgumentTypePositional,
  defaultArgumentPropTypes,
  validArgumentTypes,
  getArgumentProperties,
  getArgumentTypeData,
  getArgumentTypeDefaults
}
