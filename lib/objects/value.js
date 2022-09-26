// args <https://github.com/msikma/args>
// © MIT license

const langDefault = require('../lang/default')
const { parseArgument } = require('cmd-tokenize').util
const { getArgumentTypeData } = require('../arguments')
const { createFormatter } = require('../help')
const { getArgumentTypeDefaults } = require('../arguments')
const { parseArguments, getParsedArguments, validateValues } = require('../parser')
const { processAssets } = require('../lang/process')
const { validateValueOpts, validateArgumentCodes } = require('../validate')
const { ValidationError, InternalError } = require('../error')
const { getProgName, arrayWrap, omitFalsy, exit } = require('../util')



class ArgsValue {
  constructor(parent, value, passedOpts = {}) {
    const opts = validateValueOpts(passedOpts)

    // Some arguments do not take values at all (e.g. the 'count' type argument),
    // so in that case just throw an error here.
    if (!parent.typeData.properties.takesValues) {
      throw new ValidationError({
        message: `Argument type '${parent.opts.typeData.type}' does not take values`
      })
    }

    this.parser = parent.parser
    this.type = 'value'
    this.content = this.validateContent(value, parent.typeData)
    this.opts = opts
  }

  validateContent(value, typeData) {
    const validationResult = validateValues([value], typeData)
    if (!validationResult.isValid) {
      throw new ValidationError({
        message: `Argument type '${typeData.type}' does not take a value of this type: ${value}`
      })
    }
    return value
  }
}

module.exports = {
  ArgsValue
}
