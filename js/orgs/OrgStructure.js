import * as fs from 'fs'

const Node = class {
  constructor([name, parentName]) {
    this.name = name
    this.parentName = parentName
    this.parent = undefined
    this.children = []
  }

  getName() { return this.name }
  getParent() { return this.parent }
  getChildren() { return this.children }
  getDescendents() {
    return this.children.reduce((desc, child) => desc.concat(child.getDescendents()), [...this.children])
  }
  getTreeNodes() {
    return this.children.reduce((desc, child) => desc.concat(child.getTreeNodes()), [this])
  }
}

const OrgStructure = class {
  constructor(fileName) {
    const nodes = JSON.parse(fs.readFileSync(fileName)).map(r => new Node(r))
    this.roots = []

    nodes.forEach(node => {
      if (node.parentName === null) {
        node.parent = null // which is not undefined, but positively null
        this.roots.push(node)
      }
      else {
        const parent = nodes.find(n => n.name === node.parentName)
        if (parent === undefined)
          throw new Error(`Invalid org structure. Role '${node.name}' references non-existent manager role '${node.parentName}'.`)

        node.parent = parent
        parent.children.push(node)
      }
    })

    let roles = this.getNodes().map(n => n.getName())
    if ((roles = roles.filter((name, index) => roles.indexOf(name) !== index )).length !== 0)
      throw new Error(`Found non-unique roles in org structure: ${roles.join(', ')}`)
  }

  getRoots() { return this.roots }

  getNodes() {
    return this.roots.reduce((nodes, root) => nodes.concat(root.getTreeNodes()), [])
  }

  getNodeByRoleName(name) {
    return this.getNodes().find(n => n.getName() == name)
  }
}

export { OrgStructure }
