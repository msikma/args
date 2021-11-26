// args <https://github.com/msikma/args>
// © MIT license

const { validateProps } = require('prop-validator')
const { isPlainObject, isBoolean, mergeDeep, isString } = require('./util')
const { ValidationError, InternalError } = require('./error')
const { getArgumentProperties, defaultArgumentType, defaultArgumentTypePositional, globalArgumentDefaultsPositional, defaultArgumentPropTypes, validArgumentTypes } = require('./arguments')
const { defaultObjectOpts, defaultFormatOpts, defaultObjectPropTypes, defaultFormatPropTypes } = require('./defaults')

/** All valid object types. */
const objectTypes = ['parser', 'command', 'section', 'argument', 'value']

/**
 * Validates the user's formatting and language options and returns their final versions
 * with the defaults merged in.
 */
const validateFormatterOpts = (lang, userFormatOpts, userLangOpts) => {
  const formatOpts = { ...defaultFormatOpts, ...userFormatOpts }
  const langOpts = { ...lang.opts, ...userLangOpts }

  const formatValidation = validateProps(defaultFormatPropTypes, formatOpts)
  const langValidation = { isValid: true }//validateProps(defaultLangPropTypes, langOpts) TODO
  
  if (!formatValidation.isValid) throw new ValidationError({ type: 'parser.formatOptions', errors: formatValidation.errors })
  if (!langValidation.isValid) throw new ValidationError({ type: 'parser.langOptions', errors: langValidation.errors })

  return { formatOpts, langOpts }
}

/**
 * This function changes some of the reported errors to be more easily understandable.
 */
const clarifyOptsErrors = (objectType, passedErrors) => {
  return passedErrors.map(error => {
    if (objectType === 'argument') {
      if (error.key === 'type') {
        error.message = `Argument type must be one of ${validArgumentTypes.map(t => `'${t}'`).join(' | ')}`
      }
      if (error.key === 'nargs') {
        error.message = `Property 'nargs' must be an integer or one of { *, +, ? }`
      }
    }
    return error
  })
}

/**
 * This function changes some of the reported errors to be more easily understandable.
 * 
 * Runs after argument validation.
 */
const clarifyArgumentErrors = (argumentType, passedErrors) => {
  return passedErrors.map(error => {
    if (error.key === 'nargs' && error.valueExpectedTypeList.includes('number: integer: 0 < n') && error.valueExpectedTypeList.includes('string: "+"')) {
      error.message = `Property 'nargs' must be a number greater than 0 or the value '+'`
    }
    return error
  })
}

/**
 * Validates the options passed to a number of objects.
 * 
 * Typically this is not called directly, and validateCommandOpts(), validateArgumentOpts() etc. is used instead.
 */
const validateOpts = function(type, opts, parserReference, validationOpts = {}) {
  // Reference to the localized argument type defaults. This will be null
  // if we're not validating an argument, or if a parser object has not been initialized yet.
  const typeDefaults = parserReference?.settings?.typeDefaults

  if (!objectTypes.includes(type)) {
    throw new InternalError({
      message: `Attempted to validate an incorrect object type: '${type}' (must be one of {${objectTypes.join(',')}})`
    })
  }

  if (!isPlainObject(opts)) {
    throw new ValidationError({
      message: `Property 'options' must be a plain object`
    })
  }

  // Perform regular error checking.
  const optsValidation = validateProps(defaultObjectPropTypes[type], opts, false)
  if (!optsValidation.isValid) {
    throw new ValidationError({ type, errors: clarifyOptsErrors(type, optsValidation.errors) })
  }

  if (type === 'command') {
    //console.log('typecheck command', opts)
    // TODO: validate command
  }

  if (type === 'argument') {
    // Whether this is a positional or optional argument.
    const { isOption } = validationOpts

    // Validate based on the user's options merged with the default ones.
    const argumentType = opts.type || (isOption ? defaultArgumentType : defaultArgumentTypePositional)
    const typeOpts = mergeDeep(typeDefaults[argumentType], (isOption ? {} : globalArgumentDefaultsPositional), opts, { type: argumentType })
    const typeProps = getArgumentProperties(argumentType)
    const argumentValidation = validateProps(defaultArgumentPropTypes[argumentType], typeOpts)
    if (!argumentValidation.isValid) {
      throw new ValidationError({ type, argumentType, errors: clarifyArgumentErrors(argumentType, argumentValidation.errors) })
    }

    // Some additional checks.
    if (isBoolean(typeOpts.value) && isBoolean(typeOpts.defaultValue) && typeOpts.value === typeOpts.defaultValue) {
      throw new ValidationError({
        message: `Property 'value' and 'defaultValue' cannot be the same`
      })
    }

    if (!typeProps.takesValues && typeOpts.metavar) {
      throw new ValidationError({
        type,
        argumentType,
        message: `No values are permitted, so 'metavar' must be null`
      })
    }

    return typeOpts
  }

  const mergedOpts = mergeDeep(defaultObjectOpts[type], opts)



  if (type === 'parser') {
    const { preferLongCodes, preferShortCodes } = opts.formatOptions ?? {}

    // Check to ensure the user didn't set 'preferLongCodes' and 'preferShortCodes' to the same value.
    // Also, ensure that one is true and the other is false.
    if (preferLongCodes != null && preferShortCodes != null && (preferLongCodes === preferShortCodes)) {
      throw new ValidationError({
        type,
        message: `Properties 'preferLongCodes' and 'preferShortCodes' cannot be the same`
      })
    }
    if (preferLongCodes != null && preferShortCodes == null) {
      mergedOpts.formatOptions.preferShortCodes = !preferLongCodes
    }
    if (preferLongCodes == null && preferShortCodes != null) {
      mergedOpts.formatOptions.preferLongCodes = !preferShortCodes
    }
  }

  return mergedOpts
}

/** Validates parser options. */
const validateParserOpts = (...args) => validateOpts('parser', ...args)

/** Validates command options. */
const validateCommandOpts = (...args) => validateOpts('command', ...args)

/** Validates section options. */
const validateSectionOpts = (...args) => validateOpts('section', ...args)

/** Validates argument options. */
const validateArgumentOpts = (...args) => validateOpts('argument', ...args)

/** Validates value options. */
const validateValueOpts = (...args) => validateOpts('value', ...args)

/** Runs a quick check to see if the user passed valid argument codes. */
const validateArgumentCodes = argCode => {
  if (!Array.isArray(argCode)) {
    throw new ValidationError({
      message: `Argument codes must be an array`
    })
  }
  if (argCode.find(code => !isString(code))) {
    throw new ValidationError({
      message: `All argument codes must be strings`
    })
  }
  return argCode
}

module.exports = {
  defaultFormatOpts,
  defaultObjectOpts,
  validateOpts,
  validateParserOpts,
  validateCommandOpts,
  validateSectionOpts,
  validateArgumentOpts,
  validateArgumentCodes,
  validateValueOpts,
  validateFormatterOpts
}
