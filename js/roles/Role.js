const Role = class {
  constructor(item) {
    this.item = item
  }

  getName() { return this.item.name }
}

const AttachedRole = class {
  constructor(roles, staff) {
    const roleName = staff.getRoleNames()
    const baseRole = roles.getByName(roleName)
    if (baseRole === undefined)
      throw new Error(`Unable to find definition for structural row '${roleName}'.`)
  }
}

export { Role, AttachedRole }
