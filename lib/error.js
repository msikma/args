// args <https://github.com/msikma/args>
// © MIT license

/** Prefixes an error code with 'ARGS_'. */
const wrapCode = (code, defaultCode) => {
  const value = code || defaultCode || 'ERROR'
  return [`ARGS_${value}`, `${value}`]
}

/** Returns a human readable error string for reporting validation errors */
const getErrorText = (errors = []) => {
  if (errors.length === 0) return ''
  if (errors.length === 1) {
    return errors[0].message
  }
  else {
    return `Multiple options errors:\n${errors.map(e => `- ${e.message}`).join('\n')}`
  }
}

/** Base class for reporting errors. */
class BaseError extends Error {
  constructor(args = {}, codeFallback = 'ERROR') {
    super(args)

    const [code, originalCode] = wrapCode(args.code, codeFallback)

    this.isArgsError = true
    this.code = code
    this.originalCode = originalCode
    this.message = args.message ?? (args.code ?? '(No details available)')
  }
}

/** Class for errors that occur as a result of a problem in the code. */
class InternalError extends BaseError {
  constructor(args = {}) {
    super(args, 'INTERNAL_ERROR')
    this.message = args.message ?? '(No details available)'
  }
}

/** Class for errors that occur as a result of a problem in the code. */
class ParseError extends BaseError {
  constructor(args = {}) {
    super(args, 'PARSE_ERROR')
    this.argInput = args.argInput ?? {}
    this.argRef = args.argRef ?? {}
    this.invalidValues = args.invalidValues ?? []
    this.argsMissing = args.argsMissing ?? {}
    this.activeCmd = args.activeCmd ?? {}
  }
}

/**
 * Returns an error that gets thrown when the user's passed options object is invalid.
 */
class ValidationError extends BaseError {
  constructor(args = {}) {
    super(args, 'OPTS_ERROR')

    const prefix = [args.type ?? '', args.argumentType ? ` type '${args.argumentType}'` : ''].join('')
    const message = args.message ? args.message : ''

    this.message = `${prefix ? `${prefix}: ` : ''}${message}${getErrorText(args.errors)}`
  }
}

module.exports = {
  BaseError,
  InternalError,
  ParseError,
  ValidationError
}
