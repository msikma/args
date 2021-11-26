// args <https://github.com/msikma/args>
// © MIT license

const process = require('process')
const { basename } = require('path')

/** Returns information about the current terminal. */
const getTermInfo = () => {
  return {
    width: process.stdout.columns,
    height: process.stdout.rows
  }
}

/**
 * Returns the name of the currently running program.
 * 
 * Used to display the name of the program in the usage information.
 */
const getProgName = name => {
  // If the user provided a program name, use that.
  if (name) return name

  // If not, use the name of the process caller.
  return basename(process.argv[1])
}

module.exports = {
  getProgName,
  getTermInfo
}
