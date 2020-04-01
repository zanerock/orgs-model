const Staff = class {
  constructor(item) {
    this.item = item
    this.managers = {}
    this.reports = {}
  }

  getEmail() { return this.item.email }
  setEmail(v) { this.item.email = v }

  getFamilyName() { return this.item.familyName }
  setFamilyName(v) { this.item.familyName = v }

  getGivenName() { return this.item.givenName }
  setGivenName(v) { this.item.givenName = v }

  getStartDate() { return this.item.startDate }
  setStartDate(v) { this.item.startDate = v }

  getRoleNames() { return Object.keys(this.managers) }

  getManagerByRoleName(roleName) { return this.managers[roleName] }
  getManagers() { return Object.values(this.manangers) }

  getReportsByRoleName(roleName) { return this.reports[roleName] }
  getReports() {
    return Object.values(this.reports).reduce((acc, reps) => acc.concat(reps), []).
      filter(rep => rep.getEmail() !== this.getEmail())
  }
}

export { Staff }
