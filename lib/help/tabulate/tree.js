// args <https://github.com/msikma/args>
// © MIT license

const { objectKeyMap } = require('../../util')
const { InternalError } = require('../../error')

function tabulateObjectTree(rootObject, argGroups, argColumns) {
  const argObjects = objectKeyMap([...argGroups.argCommands, ...argGroups.argOptions, ...argGroups.argPositional], 'id')
  const sections = rootObject.getObjectTree()

  // Some metadata about the tree we're generating.
  const meta = {
    // Arguments that are so large they need the whole row for themselves.
    oversizedArguments: 0
  }
  // List of rows; each row is an array of columns.
  const rows = []
  let res

  for (const item of sections) {
    if (['text'].includes(item.type)) {
      res = this.tabulateSectionText(item, argColumns)
      rows.push(...res.rows)
      continue
    }
    
    if (['commands', 'arguments'].includes(item.type)) {
      if (!item.children?.length) {
        continue
      }
      // Push the header for this section.
      res = this.tabulateSectionHeader(item, argColumns)
      rows.push([res.rows])

      // Now push the commands, arguments and options associated with this section.
      const args = []
      for (const id of item.children) {
        const arg = argObjects[id]
        res = this.tabulateSectionChild(arg, argColumns, item.type)
        if (res.isOversizedArgument) {
          meta.oversizedArguments += 1
        }
        args.push(res.rows)
      }
      rows.push([...args.flat()])
      continue
    }

    throw new InternalError({ message: 'Invalid section type' })
  }

  return {
    meta,
    rows
  }
}

module.exports = {
  tabulateObjectTree
}
