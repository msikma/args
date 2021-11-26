// args <https://github.com/msikma/args>
// © MIT license

/**
 * Returns the indices of an argument's codes, split by short/long options.
 * 
 * For example, if an argument has the codes ['-f', '--foo'], this would return:
 * { codeShort: [0], codeLong: [1] }. These are used to format the argument code summary;
 * see formatArgSummary() for more information.
 */
function getArgOptionIndices(arg) {
  // Add index value to the codes.
  const codesN = arg.codes.map((code, n) => ({ ...code, n }))
  return {
    codeShort: codesN.filter(code => code.details.isOption && code.details.isLongOption === false).map(code => code.n),
    codeLong: codesN.filter(code => code.details.isLongOption === true || !code.details.isOption).map(code => code.n),
  }
}

/**
 * Recursively adds metadata to an object for use by the help formatter.
 * 
 * Among other things, this calculates the visual width of strings we need to show in the table.
 * This needs to be done to ensure we calculate the correct width of the table rows, in case
 * the user passes CJK wide characters.
 */
function addObjectMetadata(obj) {
  if (obj.type === 'argument') {
    const codeIndices = getArgOptionIndices(obj)
    const codeSummary = this.formatArgSummary(obj)
    const codeSummaryShort = this.formatArgSummary(obj, false, codeIndices.codeShort)
    const codeSummaryLong = this.formatArgSummary(obj, true, codeIndices.codeLong)
    const codeSummaryIsSplit = codeSummaryShort && codeSummaryLong
    return {
      ...obj,
      codes: obj.codes.map(o => this.addObjectMetadata(o)),
      metavars: obj.metavars.map(o => this.addObjectMetadata(o)),
      objects: obj.objects.map(o => this.addObjectMetadata(o)),
      _codeSummary: codeSummary,
      _codeSummaryWidth: this.stringWidth(codeSummary),
      _codeSummaryIsSplit: codeSummaryIsSplit,
      _codeSummaryShort: codeSummaryShort,
      _codeSummaryLong: codeSummaryLong,
      _codeSummaryShortWidth: this.stringWidth(codeSummaryShort),
      _codeSummaryLongWidth: this.stringWidth(codeSummaryLong)
    }
  }

  if (obj.type === 'value') {
    return {
      ...obj,
      _valueSummary: this.formatValue(obj)
    }
  }

  if (obj.type === 'code') {
    return {
      ...obj,
      _contentWidth: this.stringWidth(obj.content)
    }
  }

  if (['metavar', 'command'].includes(obj.type)) {
    return {
      ...obj,
      _contentWidth: this.stringWidth(obj.content)
    }
  }

  return arg
}

/**
 * Returns all of the parser's argument types grouped together.
 * 
 * Also returns the short and long option codes separately, with _arg as reference to their parent argument.
 * 
 * The three types are positional arguments (includes commands), short options and long options.
 */
function getProcessedArgGroups(rootObject) {
  const args = rootObject.getArguments().map(obj => this.addObjectMetadata(obj))
  const commands = rootObject.getCommands().map(obj => this.addObjectMetadata(obj))
  const positional = args.filter(arg => !arg.isOption)
  const options = args.filter(arg => arg.isOption)

  // Codes only:
  const optionsShort = options.flatMap(arg => arg.codes.filter(code => !code.details.isLongOption).map(code => ({ ...code, _arg: arg })))
  const optionsLong = options.flatMap(arg => arg.codes.filter(code => code.details.isLongOption).map(code => ({ ...code, _arg: arg })))
  
  return {
    argCommands: commands,
    argOptions: options,
    argOptionsShort: optionsShort,
    argOptionsLong: optionsLong,
    argPositional: positional
  }
}

module.exports = {
  addObjectMetadata,
  getProcessedArgGroups
}
