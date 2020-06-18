import * as fs from 'fs'

const Node = class {
  constructor([name, primMngrName, possibleMngrNames]) {
    this.name = name
    this.primMngrName = primMngrName
    this.primMngr = undefined
    this.possibleMngrNames = possibleMngrNames || []
    if (primMngrName) this.possibleMngrNames.unshift(primMngrName)
    this.possibleMngrs = []
    this.children = []
  }

  getName() { return this.name }

  getPrimMngr() { return this.primMngr }

  getPossibleMngrs() { return this.possibleMngrs }

  getChildren() { return this.children }

  getDescendents() {
    return this.children.reduce((desc, child) => desc.concat(child.getDescendents()), [...this.children])
  }

  getTreeNodes() {
    return this.children.reduce((desc, child) => desc.concat(child.getTreeNodes()), [this])
  }
}

const OrgStructure = class {
  constructor(fileName, roles) {
    const nodes = JSON.parse(fs.readFileSync(fileName)).map(r => new Node(r))
    this.roots = []

    nodes.forEach(node => {
      if (node.primMngrName === null) {
        node.primMngr = null // which is not undefined, but positively null
        this.roots.push(node)
      }
      else {
        const primMngr = nodes.find(n => n.name === node.primMngrName)
        if (primMngr === undefined) {
          throw new Error(`Invalid org structure. Role '${node.name}' references `
                          + `non-existent primary manager role '${node.primMngrName}'.`)
        }

        node.primMngr = primMngr
        primMngr.children.push(node)

        node.possibleMngrNames.forEach(mngrName => {
          const mngr = nodes.find(n => n.name === mngrName)
          if (mngr === undefined) {
            throw new Error(`Invalid org structure. Role '${node.name}' references `
                            + `non-existent possible manager role '${mngrName}'.`)
          }

          node.possibleMngrs.push(mngr)
        })
      }
    })

    const orgRoles = this.getNodes().map(n => n.getName())
    // check all org role names reference defined roles
    const undefinedRoles = orgRoles.filter((roleName) => roles.get(roleName) === undefined)
    if (undefinedRoles.length > 0) {
      throw new Error('Found undefined role reference'
                      + `${undefinedRoles.length > 1 ? 's' : ''}: ${undefinedRoles.join(', ')}`)
    }
    // check for duplicate org roles
    const dupeRoles = orgRoles.filter((name, index) => orgRoles.indexOf(name) !== index)
    if (dupeRoles.length > 0) {
      throw new Error(`Found non-unique role${dupeRoles.length > 1 ? 's' : ''} `
                      + `references in org structure: ${dupeRoles.join(', ')}`)
    }
  }

  getRoots() { return [...this.roots] }

  getNodes() {
    return this.roots.reduce((nodes, root) => nodes.concat(root.getTreeNodes()), [])
  }

  getNodeByRoleName(name) {
    return this.getNodes().find(n => n.getName() === name)
  }
}

export { OrgStructure }
