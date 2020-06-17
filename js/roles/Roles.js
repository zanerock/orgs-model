import * as fs from 'fs'

import { Role } from './Role'

const Roles = class {
  constructor(fileName) {
    const data = JSON.parse(fs.readFileSync(fileName))
    this.list = data.map((rec) => new Role(rec))
    this.map = this.list.reduce((acc, role, i) => {
      if (acc[role.getName()] !== undefined) {
        throw new Error(`Role with name '${role.name}' already exists at entry ${i}.`)
      }
      acc[role.getName()] = role
      return acc
    }, {})
  }

  getAll() { return this.list.slice() }

  get(name) { return this.map[name] }

  /**
  * Swaps out the 'super role' name for the actual super role object.
  */
  hydrate() {
    this.list.forEach((role, i) => {
      if (role.superRole !== undefined) {
        const superRole = this.get(role.superRole)
        if (superRole === undefined) { throw new Error(`Could not find super-role '${role.superRole}' for role '${role.getName()}' (entry ${i}).`) }
        role.superRole = superRole
      }
    })

    return this
  }
}

export { Roles }
