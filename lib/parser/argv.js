// args <https://github.com/msikma/args>
// © MIT license

const process = require('process')

const getArgv = () => {
  const argv = process.argv
  const node = argv[0]
  const bin = argv[1]
  return {
    node,
    bin,
    args: argv.slice(2)
  }
}

module.exports = {
  getArgv
}
