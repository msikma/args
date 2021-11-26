// args <https://github.com/msikma/args>
// © MIT license

const assets = {
  /** Optional ellipsis at the end of a metavar list. */
  argOptionalEllipsis: str => `${str}...`,

  /** Wraps something inside brackets. */
  argOptionalBrackets: str => `[${str}]`,

  /** Formatting for an argument value. */
  argValueCode: (strValue, strDescription) => `- ${strValue}: ${strDescription}`,

  /** Joins together an array of argument strings, e.g. ['-p PATH', '--path PATH'] to "-p PATH, --path PATH". */
  joinArgs: argItems => argItems.join(', '),

  /** Joins together an array of metavars, e.g. ['SOURCE', 'TARGET'] to "SOURCE TARGET". */
  joinMetavars: metavarItems => metavarItems.join(' '),

  /** Converts an argument into a metavar. */
  toMetavar: arg => arg.match(/^[-]*(.+?)$/)[1].toUpperCase()
}

const opts = {
  wordBreak: 'words' // or 'letters'
}

module.exports = {
  genericAssets: assets,
  genericOpts: opts
}
