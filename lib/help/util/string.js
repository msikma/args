// args <https://github.com/msikma/args>
// © MIT license

const { wordWrap, util } = require('wordwrap-cjk')

function stringWrap(content, width, subIndent = 0) {
  if (width === 0) return ''
  const wrapped = wordWrap(content, {
    maxWidth: width,
    indentAmount: subIndent,
    indentAmountFirstLine: 0,
    useVisualWidth: this.opts.useVisualWidth,
    whitespaceMaintainLinebreaks: true,
    whitespaceNormalize: false,
    padToMaxWidth: true,
    whitespaceTrim: false
  })
  return wrapped
}

function stringWidth(str) {
  if (this.opts.useVisualWidth) {
    return util.stringWidth(str)
  }
  return str.length
}

module.exports = {
  stringWidth,
  stringWrap
}
