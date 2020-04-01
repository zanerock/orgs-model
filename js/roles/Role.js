const Role = class {
  constructor(item) {
    this.item = item
  }

  getName() { return this.item.name }

  attachTo(staff, qualifiers) {
    return new AttachedRole(this, staff, qualifiers)
  }
}

const AttachedRole = class {
  constructor(baseRole, staff, qualifiers) {
    qualifiers = (qualifiers !== undefined && qualifiers.split(/\s*;\s*/)) || []
    this.baseRole = baseRole
    this.acting = qualifiers.some(q => q === 'acting')
  }

  getName() { return this.baseRole.getName() }

  isActing() { return this.acting }
}

export { Role, AttachedRole }
