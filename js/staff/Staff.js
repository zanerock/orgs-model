const Staff = class {
  constructor(item) {
    this.item = item
    this.managers = {}
    this.reports = {}
    this.roles = []
  }

  getEmail() { return this.item.email }
  setEmail(v) { this.item.email = v }

  getFamilyName() { return this.item.familyName }
  setFamilyName(v) { this.item.familyName = v }

  getGivenName() { return this.item.givenName }
  setGivenName(v) { this.item.givenName = v }

  getStartDate() { return this.item.startDate }
  setStartDate(v) { this.item.startDate = v }
}

export { Staff }
