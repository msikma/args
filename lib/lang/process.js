// args <https://github.com/msikma/args>
// © MIT license

/**
 * Processes the assets before they are finalized and handed over to the parser.
 */
const processAssets = assets => {
  // For when we need to know the width of the separator strings, for calculating the column sizes.
  assets.argSeparator = assets.joinArgs(['', ''])
  assets.metavarSeparator = assets.joinMetavars(['', ''])

  return assets
}

/**
 * Modifies an argument array to use either single or double dashes and returns it.
 * 
 * This is used to turn e.g. ['-h', '--help'] into ['-h', '-help'] if the user prefers single dashes.
 */
const prefixArgumentCodes = (useSingleDash, args) => {
  const prefixShort = '-'
  const prefixLong = useSingleDash ? '-' : '--'

  return args
    .map(arg => arg.replace(/^-+/, ''))
    .map((arg, n) => n === 0 ? `${prefixShort}${arg}` : `${prefixLong}${arg}`)
}

module.exports = {
  processAssets,
  prefixArgumentCodes
}
