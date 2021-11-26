// args <https://github.com/msikma/args>
// © MIT license

const { validateSectionOpts } = require('../validate')
const { arrayWrap } = require('../util')

class ArgsSection {
  constructor(parent, title, passedOpts = {}, isRoot = false) {
    const opts = validateSectionOpts(passedOpts)
    this.parser = parent.parser
    this.command = parent
    this.type = 'section'
    this.title = title
    this.opts = opts
    this.objects = []
    this.isRoot = isRoot
  }

  getAllObjects() {
    const objs = []
    for (const obj of this.objects) {
      if (obj.type === 'text') continue
      objs.push(obj)
    }
    return objs
  }

  pushObject(object) {
    this.objects.push(object)
  }

  addCommand(content, opts) {
    return this.command.addCommand(content, opts, this)
  }

  addArgument(content, opts) {
    return this.command.addArgument(content, opts, this)
  }

  addText() {
    const text = { type: 'text', values: arrayWrap(value) }
    this.objects.push(text)
    return text
  }
}

module.exports = {
  ArgsSection
}
