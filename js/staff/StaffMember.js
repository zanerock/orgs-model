const StaffMember = class {
  constructor(item) {
    this.item = item
    this.attachedRoles = {} // keyed by role name
    this.managers = {} // managers keyed by our role names
    this.reportsByReportRole = {} // roles keyed to reports role names
  }

  getEmail() { return this.item.email }
  setEmail(v) { this.item.email = v }

  getFullName() { return `${this.getGivenName()} ${this.getFamilyName()}` } // TODO: i18n...

  getFamilyName() { return this.item.familyName }
  setFamilyName(v) { this.item.familyName = v }

  getGivenName() { return this.item.givenName }
  setGivenName(v) { this.item.givenName = v }

  getStartDate() { return this.item.startDate }
  setStartDate(v) { this.item.startDate = v }

  getEmploymentStatus() { return this.item.employmentStatus }
  setEmploymentStatus(v) { this.item.employmentStatus = v }

  hasRole(roleName) { return Boolean(this.attachedRoles[roleName]) }

  getRoleNames() { return Object.keys(this.attachedRoles) }

  getAttachedRoleByName(roleName) { return this.attachedRoles[roleName] }

  getAttachedRoles() { return Object.values(this.attachedRoles) }

  getManagerByRoleName(roleName) { return this.managers[roleName] }

  getManagers() { return Object.values(this.manangers) }

  getReportsByRoleName(roleName) { return this.reportsByReportRole[roleName] || [] }
  getReports() {
    return Object.values(this.reportsByReportRole).reduce((acc, reps) => acc.concat(reps), []).
      filter(rep => rep.getEmail() !== this.getEmail())
  }
}

export { StaffMember }
