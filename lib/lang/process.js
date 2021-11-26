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

module.exports = {
  processAssets
}
