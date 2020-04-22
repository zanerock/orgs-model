const Staff = class {
  constructor(item) {
    this.item = item
    this.attachedRoles = {} // keyed by role name
    this.managers = {} // managers keyed by our role names
    this.reportsByReportRole = {} // roles keyed to reports role names
  }

  /**
   * Fully defines the staff data. This is done as a static method to allow us to retrieve staff my name and cross-link
   * managers with reports. In the underlying datastructure, reports are linked to managers and not vice-a-versa, so we
   * have to pre-define the universe of staff individuals in prep for / before fully defining each..
   */
  static hydrate(org) {
    Object.values(org.staff).forEach(s => {
      s.item.primaryRoles.forEach(rSpec => {
        const [roleName, roleManagerEmail, roleParameters] = rSpec.split(/\//)

        // verify good roleName
        const orgNode = org.orgStructure.getNodeByRoleName(roleName)
        if (orgNode === undefined)
          throw new Error(`Staff '${s.getEmail()}' claims non-existent role '${roleName}'.`)

        // attach the role
        s.attachedRoles[roleName] = org.roles[roleName].attachTo(s, roleParameters)

        // TODO: migrate the manager to the AttachedRole
        // set manager and add ourselves to their reports
        if (orgNode.getPrimMngr() !== null) {
          const roleManager = org.getStaffMember(roleManagerEmail)
          if (roleManager === undefined)
            throw new Error(`No such manager '${roleManagerEmail}' found while loading staff member '${s.getEmail()}'.`)

          s.managers[roleName] = roleManager
          if (roleManager.reportsByReportRole[roleName] === undefined)
            roleManager.reportsByReportRole[roleName] = []
          roleManager.reportsByReportRole[roleName].push(s)
        }
        else s.managers[roleName] = null
      })
    })
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

export { Staff }
