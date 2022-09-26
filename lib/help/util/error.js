// args <https://github.com/msikma/args>
// © MIT license

/**
 * Returns a human readable string for an error object.
 * 
 * This is used to give feedback to the user when invalid input is passed.
 */
function getErrorDetails(error) {
  const { L } = this
  const code = error.originalCode

  if (code === 'UNKNOWN_OPTION') {
    return L.errorUnknownOptionalArgument(error)
  }
  if (code === 'UNKNOWN_ARGUMENT') {
    return L.errorUnknownPositionalArgument(error)
  }
  if (code === 'INCORRECT_NUMBER_OF_VALUES') {
    return L.errorIncorrectNumberOfValues(error)
  }
  if (code === 'INVALID_VALUE_TYPE') {
    return L.errorInvalidValueType(error)
  }
  if (code === 'INVALID_VALUE_OPTS') {
    return L.errorInvalidValueOption(error)
  }
  if (code === 'MISSING_ARGUMENTS') {
    return L.errorMissingArguments(error)
  }

  // We should definitely never reach this, but just in case.
  if (error.isArgsError) {
    // TODO: make these regular errors
    return L.errorFallback(error)
  }

  // For all errors that we didn't threw ourselves, such as ReferenceError, etc.
  // In this case we actually don't do word wrapping like normal in the output.
  return { details: L.errorFallbackGeneric(error), isGenericError: true }
}

module.exports = {
  getErrorDetails
}
