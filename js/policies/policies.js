import { Roles } from '../roles'

const Policies = class {
  #roles
  #rolesFile
	sourceFiles

	constructor() {
    this.sourceFiles = []
    this.rolesFile = 'roles.tsv'
  }

  addSourceFile(fileName) {
    this.sourceFiles.push(fileName)
  }

  setRolesFile(name) {
    this.rolesFile = name
  }

  getRoles() {
    if (this.roles !== undefined) return this.roles

    const rolesFile = this.findFile(this.rolesFile)
    this.roles = new Roles(rolesFile)
    return this.roles
  }

  findFile(baseName) {
    const re = new RegExp(`/${baseName}$`)
    const results = this.sourceFiles.filter((f) => f.match(re))
    if (results.length > 1) throw new Error(`Found multiple files matching '${baseName}'`)
    else if (results.length === 0) return null
    else return results[0]
  }
}

export { Policies }
