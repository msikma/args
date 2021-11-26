// args <https://github.com/msikma/args>
// © MIT license

const { parseArgument } = require('cmd-tokenize').util
const { validateCommandOpts } = require('../validate')
const { ValidationError, InternalError } = require('../error')
const { isString, omitFalsy } = require('../util')
const { ArgsSection } = require('./section')
const { ArgsArgument } = require('./argument')

class ArgsCommand {
  constructor(parent, content, passedOpts = {}, isRoot = false) {
    const opts = validateCommandOpts(passedOpts)

    if (!(isString(content) || (isRoot && content == null))) {
      // 'content' is 'null' only when making the root command, which only the system does.
      throw new ValidationError({ message: 'Command content must be a string' })
    }

    // Generate code object to facilitate parsing. See <argument.js>.
    const codes = parseArgument(content ?? '', { unpackCombinedOptions: false }).map(codeDetails => {
      if (codeDetails.isOption) {
        throw new ValidationError({ message: `Commands may not be dashed options; you may have intended to use .addArgument() instead of .addCommand(): ${content ?? ''}` })
      }
      return {
        content: codeDetails.content,
        type: 'code',
        opts: {},
        details: codeDetails
      }
    })

    // Key name for the result object; see <argument.js>.
    const key = getCommandKey(codes, opts)

    this.parser = parent.parser
    this.parent = parent
    this.type = 'command'
    this.id = this.parser.getArgumentID()
    this.key = key
    this.content = content ?? '<root>'
    this.codes = codes 
    this.opts = opts
    this.objects = []
    this.rootObjects = {}
    this.knownArgumentCodes = []
    this.knownArgumentKeys = []
    this.isRootCommand = isRoot

    this.addRootSections()
  }

  getCommandPath() {
    if (this.isRootCommand) return []
    return [this.content, ...this.parent.getCommandPath()]
  }

  getAllSections() {
    return [this.rootObjects.sectionCommands, ...this.objects, this.rootObjects.sectionPositional, this.rootObjects.sectionOptional]
  }

  getAllObjectsOfType(type, maxDepth = 0, currentDepth = 0) {
    const sections = this.getAllSections()
    const argGroups = []
    const command = {
      id: this.id,
      name: this.content,
      ref: this,
      children: [],
      objects: []
    }
    for (const section of sections) {
      const objs = section.getAllObjects()
      for (const obj of objs) {
        if (obj.type === 'command' && ((maxDepth > currentDepth) || maxDepth === Infinity)) {
          const childGroups = obj.getAllObjectsOfType(type, maxDepth, currentDepth + 1)
          argGroups.push(...Object.entries(childGroups))
          command.children.push(...Object.keys(childGroups))
        }
        if (obj.type === type) {
          command.objects.push(obj)
        }
      }
    }
    if (maxDepth === 0) {
      return command
    }
    return Object.fromEntries([[this.id, command], ...argGroups])
  }

  getObjectTree() {
    return omitFalsy(this.getAllSections().map(section => this.getSectionTree(section)))
  }

  /**
   * Returns the object tree for a specific section item.
   * 
   * Used by getObjectTree() to retrieve all arguments under a section.
   */
  getSectionTree(section) {
    const hasCommands = section.objects.find(obj => ['argument', 'command'].includes(obj.type))
    return {
      title: section.title,
      type: 'arguments',
      object: section,
      children: section.objects.filter(obj => ['argument', 'command'].includes(obj.type)).map(obj => obj.id)
    }
  }

  getArgumentHierarchy() {
    return this.getAllObjectsOfType('argument', Infinity)
  }

  getArguments() {
    return this.getAllObjectsOfType('argument').objects
  }

  getCommands() {
    return this.getAllObjectsOfType('command').objects
  }

  getObjectList() {
    const args = []
    for (const command of parserReference.objects) {
      if (command.type !== 'command' || !command.objects) {
        continue
      }
      for (const section of command.objects) {
        for (const obj of section.objects) {
          if (obj.type !== 'argument') continue
          args.push(obj)
        }
      }

      // Add the arguments present in the root sections.
      const rootCommand = parserReference.getRootCommand()
      for (const obj of rootCommand.rootObjects.sectionPositional.objects) {
        if (obj.type !== 'argument') continue
        args.push(obj)
      }
      for (const obj of rootCommand.rootObjects.sectionOptional.objects) {
        if (obj.type !== 'argument') continue
        args.push(obj)
      }
    }
    return args
  }

  addSection(title, opts) {
    const section = new ArgsSection(this, title, opts, false)
    this.objects.push(section)
    return section
  }

  addRootSection(title, opts) {
    return new ArgsSection(this, title, opts, true)
  }

  addCommand(content, opts, target = null) {
    const command = new ArgsCommand(this, content, opts)
    const section = this.getObjectTarget(command, target)
    section.pushObject(command)
    return command
  }

  addArgument(content, opts, target = null) {
    const argument = new ArgsArgument(this, content, opts)
    const section = this.getObjectTarget(argument, target)
    section.pushObject(argument)
    this.saveArgumentCodes(argument)
    return argument
  }

  /**
   * Stores an argument's information to its corresponding command to prevent duplicates.
   */
  saveArgumentCodes(argument) {
    const codes = argument.codes.map(code => code.content)
    const key = argument.key
    const existingCodes = this.knownArgumentCodes
    const existingKeys = this.knownArgumentKeys

    // Check whether any codes or keys in this argument have already been used.
    const hasOverlappingCodes = codes.find(code => existingCodes.includes(code))
    const hasOverlappingKeys = existingKeys.includes(key)
    
    if (hasOverlappingCodes) {
      throw new ValidationError({ message: `Cannot add argument with codes [${codes.map(code => `"${code}"`).join(', ')}]: argument codes already in use` })
    }
    if (hasOverlappingKeys) {
      throw new ValidationError({ message: `Cannot add argument with key "${key}": argument key already in use` })
    }

    existingCodes.push(...codes)
    existingKeys.push(key)
  }

  getObjectTarget(object, target) {
    if (target) {
      return target
    }
    if (object.type === 'command') {
      return this.rootObjects.sectionCommands
    }
    if (object.type === 'argument') {
      if (object.isOption) {
        return this.rootObjects.sectionOptional
      }
      else {
        return this.rootObjects.sectionPositional
      }
    }
    throw new InternalError({ message: 'Could not determine object target' })
  }

  hasCommands() {
    // TODO
    return false
  }

  addRootSections() {
    const L = this.parser.settings.langAssets

    if (Object.keys(this.rootObjects).length > 0) {
      throw new InternalError({ message: 'Attempted to make a second set of root objects' })
    }

    this.rootObjects.sectionCommands = this.addRootSection(L.headerCommands, {}, true)
    this.rootObjects.sectionPositional = this.addRootSection(L.headerPositionalArguments, {}, true)
    this.rootObjects.sectionOptional = this.addRootSection(L.headerOptionalArguments, {}, true)
  }
}

/** Returns the key value used to save the user's provided input. */
const getCommandKey = (cmdCodes, opts) => {
  // User the user's provided key verbatim if passed.
  if (opts.key) {
    return opts.key.trim()
  }

  return cmdCodes[0].details.content
}

module.exports = {
  ArgsCommand
}
