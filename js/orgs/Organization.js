import { Staff } from '../staff'

const Organization = class {
  constructor(rolesTsv, staffTsv, orgStructure) {
    this.staff = {}

    // let's hydrate
    staffTsv.reset()
    let s; while ((s = staffTsv.next()) !== undefined) {
      this.staff[s.email] = new Staff(s)
    }

    Object.values(this.staff).forEach(s => { // initialize the structural data
      s.item.primaryRoles.forEach(rSpec => {
        const [roleName] = rSpec.split(/\//)
        const orgNode = orgStructure.getNodeByRoleName(roleName)
        if (orgNode === undefined)
          throw new Error(`Staff '${s.getEmail()}' claims non-existent role '${roleName}'.`)

        orgNode.getChildren().forEach(reportsRole => s.reports[reportsRole.getName()] = [])
      })
    })

    Object.values(this.staff).forEach(s => {
      s.item.primaryRoles.forEach(rSpec => {
        const [roleName, roleManagerEmail, roleQualifiers] = rSpec.split(/\//)

        const orgNode = orgStructure.getNodeByRoleName(roleName)
        // roles already verified in the first pass

        if (orgNode.getParent() !== null) {
          const roleManager = this.getStaffMember(roleManagerEmail)
          if (roleManager === undefined)
            throw new Error(`No such manager '${roleManagerEmail}' found while loading staff member '${s.getEmail()}'.`)

          s.managers[roleName] = roleManager
          roleManager.reports[roleName].push(s)
        }
      })
    })
  }

  getStaffMember(email) { return this.staff[email] }
}

export { Organization }
