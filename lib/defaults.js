// args <https://github.com/msikma/args>
// © MIT license

const { PropTypes } = require('prop-validator')
const { globalArgumentDefaults, globalArgumentDefaultPropTypes } = require('./arguments')

/**
 * Default options for all object types.
 * 
 * These get the user's options merged in.
 */
const defaultObjectOpts = {
  parser: {
    prog: null,
    title: null,
    lang: null,
    help: [],
    epilogue: [],
    description: null,
    options: {
      addHelp: true,
      addVersion: true,
      useSingleDashOptions: false,
      writeOut: console.log,
      writeErr: console.error
    },
    langOptions: {},
    formatOptions: {
      useVisualWidth: true,
      useAbbreviatedError: true,
      preferLongCodes: true,
      preferShortCodes: false
    }
  },
  command: {
    description: null
  },
  section: {
    description: null
  },
  argument: {
    ...globalArgumentDefaults
  },
  value: {
    description: null
  }
}

/**
 * PropTypes for formatting options.
 * 
 * The check is performed after the defaults have been merged in.
 */
const defaultFormatPropTypes = {
  maxWidth: PropTypes.integer.isRequired,
  paragraphMargin: PropTypes.integer.isRequired,
  argStartIndent: PropTypes.integer.isRequired,
  argDescColGap: PropTypes.integer.isRequired,
  argValueIndent: PropTypes.integer.isRequired,
  argValueDescIndent: PropTypes.integer.isRequired,
  argColMinimumWidth: PropTypes.number.isRequired,
  argColMaximumWidth: PropTypes.number.isRequired,
  argColOvershoot: PropTypes.number.isRequired,
  compactUsage: PropTypes.bool.isRequired,
  argSeparateCols: PropTypes.bool.isRequired,
  compactMetavars: PropTypes.bool.isRequired
}

/**
 * PropTypes for options passed to all object types.
 */
const defaultObjectPropTypes = {
  parser: PropTypes.shape({
    prog: PropTypes.string,
    title: PropTypes.string,
    lang: PropTypes.shape({
      code: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
      opts: PropTypes.object,
      assets: PropTypes.object
    }),
    help: PropTypes.oneOfType([PropTypes.string, PropTypes.arrayOf(PropTypes.string)]),
    description: PropTypes.oneOfType([PropTypes.string, PropTypes.arrayOf(PropTypes.string)]),
    epilogue: PropTypes.oneOfType([PropTypes.string, PropTypes.arrayOf(PropTypes.string)]),
    options: PropTypes.shape({
      addHelp: PropTypes.bool,
      addVersion: PropTypes.bool,
      useSingleDashOptions: PropTypes.bool,
      writeOut: PropTypes.function,
      writeErr: PropTypes.function
    }),
    langOptions: PropTypes.object,
    formatOptions: PropTypes.shape({
      useVisualWidth: PropTypes.bool,
      useAbbreviatedError: PropTypes.bool,
      preferLongCodes: PropTypes.bool,
      preferShortCodes: PropTypes.bool
    })
  }),
  command: PropTypes.shape({
    description: PropTypes.string
  }),
  section: PropTypes.shape({
    description: PropTypes.string
  }),
  // Note: for the arguments, we do two checks: one that only checks the basics (these validators here),
  // and then a more comprehensive check based on what its type is later on.
  argument: PropTypes.shape(globalArgumentDefaultPropTypes),
  value: PropTypes.shape({
    description: PropTypes.string
  })
}

/**
 * Default formatting options.
 */
const defaultFormatOpts = {
  // Maximum width of the output; this is used to wrap description text
  // and determine how much spacing to use in the arguments table.
  maxWidth: 80,

  // Space in between paragraphs (such as help or epilogue paragraphs).
  paragraphMargin: 1,

  // The start indent for the arguments.
  argStartIndent: 2,

  // The gap in between the argument and description columns.
  argDescColGap: 2,

  // The extra indent before printing possible argument values.
  argValueIndent: 4,

  // The indent for value descriptions that don't fit on the same line.
  argValueDescIndent: 2,

  // The minimum and maximum width of the argument column; measured as a percentage of the maximum width.
  // The start indent is taken from the left column's size.
  argColMinimumWidth: 0.175,
  argColMaximumWidth: 0.35,
  
  // The maximum amount that an argument can 'overshoot' its column.
  argColOvershoot: 0.05,

  // The gap between the program name and the usage summary.
  usageColGap: 1,

  // Note: the following options are more obscure. You probably don't need to change this
  // unless you're *really* particular about how your help output looks.

  // Abbreviates the usage indicator at the top of the header. Use this for when your
  // program has a very large amount of options to the point where it's unhelpful
  // to list them all at the top.
  compactUsage: false,

  // Causes arguments with a metavar and multiple codes to only print the metavar once,
  // after the final code. E.g. '-p, --path PATH' (true) vs '-p PATH, --path PATH' (false).
  compactMetavars: false,

  // Adds a separate column for the first argument code, e.g. for ['-p', '--path'] the '-p'
  // code will get its own separate column, and other arguments that only have a long code
  // will be printed in the column beside it.
  argSeparateCols: false
}

module.exports = {
  defaultObjectPropTypes,
  defaultFormatPropTypes,
  defaultObjectOpts,
  defaultFormatOpts
}
