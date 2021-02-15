import * as fs from 'fs'

import { Evaluator } from '@liquid-labs/condition-eval'

import { Role } from './Role'

const Roles = class {
  constructor(fileName) {
    const data = JSON.parse(fs.readFileSync(fileName))
    this.items = data.map((rec) => new Role(rec))
    this.map = this.items.reduce((acc, role, i) => {
      if (acc[role.getName()] !== undefined) {
        throw new Error(`Role with name '${role.name}' already exists at entry ${i}.`)
      }
      acc[role.getName()] = role
      return acc
    }, {})

    this.checkCondition = checkCondition
    this.key = 'name'
  }

  // TODO: deprecated
  getAll() { return this.items.slice() }
  list() { return this.items.slice() }

  get(name) { return this.map[name] }

  /**
  * Swaps out the 'super role' name for the actual super role object.
  */
  hydrate() {
    this.items.forEach((role, i) => {
      if (role.superRole !== undefined) {
        const superRole = this.get(role.superRole)
        if (superRole === undefined) { throw new Error(`Could not find super-role '${role.superRole}' for role '${role.getName()}' (entry ${i}).`) }
        role.superRole = superRole
      }
    })

    return this
  }
}

/**
* Obligitory 'checkCondition' function provided by the API for processing inclusion or exclusion of Roles targets in
* an audit.
*/
const checkCondition = (condition, role) => {
  const parameters = Object.assign(
    {
      SEC_TRIVIAL : 1,
      ALWAYS      : 1,
      NEVER       : 0
    },
    role.parameters)

  // TODO: test if leaving it 'true'/'false' works.
  parameters.DESIGNATED = role.designated ? 1 : 0
  parameters.SINGULAR = role.singular ? 1 : 0

  const zeroRes = []

  const evaluator = new Evaluator({ parameters, zeroRes })
  return evaluator.evalTruth(condition)
}

export { Roles }
