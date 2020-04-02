const AttachedRole = class {
  constructor(baseRole, staffMember, parameters) {
    parameters = (parameters !== undefined && parameters.split(/\s*;\s*/)) || []
    this.baseRole = baseRole
    this.acting = parameters.some(p => p === 'acting')
    const qualifierCapt = parameters.reduce((result, p) => result || /qual:([^,]+)/.exec(p), null)
    this.qualifier = null
    if (qualifierCapt) this.qualifier = qualifierCapt[1].trim()
    if (!baseRole.isQualifiable() && this.qualifier)
      throw new Error(`Attempt to qualify non-qualifiable role '${baseRole.getName()}' `+
                      `for staff member '${staffMember.getEmail()}'.`)
  }

  getName() { return this.baseRole.getName() }

  isActing() { return this.acting }

  isQualifiable() { return this.baseRole.isQualifiable() }

  getQualifier() { return this.qualifier }
}

export { AttachedRole }
