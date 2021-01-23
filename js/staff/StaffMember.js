const StaffMember = class {
  constructor(record) {
    Object.assign(this, record)

    this.attachedRolesByName = {}
    this.reportsByReportRole = {} // roles keyed to reports role names
  }

  getEmail() { return this.email }
  setEmail(v) { this.email = v }

  getFullName() { return `${this.getGivenName()} ${this.getFamilyName()}` } // TODO: i18n...

  getFamilyName() { return this.familyName }
  setFamilyName(v) { this.familyName = v }

  getGivenName() { return this.givenName }
  setGivenName(v) { this.givenName = v }

  getStartDate() { return this.startDate }
  setStartDate(v) { this.startDate = v }

  getEmploymentStatus() { return this.employmentStatus }
  setEmploymentStatus(v) { this.employmentStatus = v }

  getRoleNames() { return this.roles.map((r) => r.name) }

  hasRole(roleName) { return !!this.attachedRolesByName[roleName] }

  getAttachedRoles() { return this.roles.slice() }

  getAttachedRole(roleName) { return this.attachedRolesByName[roleName] }

  getManagers() { return this.roles.map((r) => r.manager) }

  getReportsByRoleName(roleName) { return this.reportsByReportRole[roleName] || [] }
  getReports() {
    return Object.values(this.reportsByReportRole).reduce((acc, reps) => acc.concat(reps), [])
      .filter(rep => rep.getEmail() !== this.getEmail())
  }

  getParameters() { return this.parameters }
}

export { StaffMember }
