// args <https://github.com/msikma/args>
// © MIT license

const { omitFalsy, isString, isInteger } = require('../../util')

/**
 * Formats a metavar help string.
 * 
 * This returns a string that explains how many arguments an option takes.
 * For example, an option that takes two arguments and has a metavar 'FOO' will get 'FOO FOO'.
 * 
 * The 'shortZeroOrMore' changes the behavior of the * nargs value and determines how large it is.
 * 
 * Options with a variable number of arguments get a string that indicates how many the user may pass.
 * See the formatArg() description for examples.
 */
function formatMetavar(arg, shortZeroOrMore = false) {
  const { L } = this
  const { nargs } = arg.opts

  const getMetavar = (n, ellipsis) => ellipsis ? L.argOptionalEllipsis('') : (arg.metavars[n] ? arg.metavars[n].content : arg.metavars[arg.metavars.length - 1].content)
  const addBrackets = (str, needed) => needed ? L.argOptionalBrackets(str) : str
  const collect = items => L.joinMetavars(omitFalsy(items))
  
  let itemTypes = []

  if (isString(nargs)) {
    // FOO [FOO ...]
    if (nargs === '+') itemTypes.push({ optional: false }, { optional: true }, { optional: false, ellipsis: true })
    // [FOO ...]
    if (nargs === '*' && shortZeroOrMore) itemTypes.push({ optional: true }, { optional: false, ellipsis: true })
    // [FOO [FOO ...]]
    if (nargs === '*' && !shortZeroOrMore) itemTypes.push({ optional: true }, { optional: true }, { optional: false, ellipsis: true })
    // [FOO]
    if (nargs === '?') itemTypes.push({ optional: true })
  }

  if (isInteger(nargs) || (nargs == null && arg.typeData.properties.takesValues)) {
    const amount = nargs || 1
    for (let n = 0; n < amount; ++n) {
      itemTypes.push({ optional: false })
    }
  }

  // Work from the inside out.
  itemTypes = itemTypes.reverse()
  let result = ''
  for (let n = 0; n < itemTypes.length; ++n) {
    const type = itemTypes[n]
    const metavar = getMetavar(itemTypes.length - n - 1, type.ellipsis)
    result = addBrackets(collect([metavar, result]), type.optional)
  }

  return result
}

/**
 * Formats a single argument string with (optionally) its metavars.
 * 
 * This is used to show to the user how an argument should be used, and is printed in the help output.
 * 
 * The output largely depends on the argument's 'nargs' and 'metavar' options. For 'nargs',
 * this indicates that either a specific or a variable number of arguments should follow this argument.
 * Some examples of how different values of 'nargs' get formatted:
 * 
 *     One or more:    +  --test TEST [TEST ...]
 *     Zero or more:   *  --test [TEST ...]
 *     One or zero:    ?  --test [TEST]
 *     Exact number:   0  --test
 *                     1  --test TEST (also used for 'null' if the argument takes a value)
 *                     3  --test TEST TEST TEST
 * 
 * The user specified 'metavar' option is used if supplied.
 */
function formatArg(arg, includeMetavars, indexValues = null) {
  const { L } = this
  const { codes } = arg

  // If indexValues isn't passed, we format all argument codes.
  if (indexValues == null) {
    indexValues = codes.map((_, n) => n)
  }

  const metavars = this.formatMetavar(arg)
  const items = []
  const argCodes = codes.map(code => code.content)
  for (let n = 0; n < indexValues.length; ++n) {
    items.push(
      includeMetavars
        ? L.joinMetavars(omitFalsy([argCodes[indexValues[n]], metavars]))
        : argCodes[indexValues[n]]
    )
  }
  return items
}

function formatArgSummary(arg, includeMetavars = true, indexValues = null) {
  const { L } = this
  return L.joinArgs(this.formatArg(arg, includeMetavars, indexValues))
}

module.exports = {
  formatArgSummary,
  formatMetavar,
  formatArg
}
