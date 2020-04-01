import { Staff } from '../../staff'

const hydrateOrg = (org) => {
  hydrateStaff(org)
}

const hydrateStaff = (org) => {
  Object.values(org.staff).forEach(s => { // initialize the structural data
    s.item.primaryRoles.forEach(rSpec => {
      const [roleName] = rSpec.split(/\//)
      const orgNode = org.orgStructure.getNodeByRoleName(roleName)
      if (orgNode === undefined)
        throw new Error(`Staff '${s.getEmail()}' claims non-existent role '${roleName}'.`)

      orgNode.getChildren().forEach(reportsRole => s.reports[reportsRole.getName()] = [])
    })
  })

  Object.values(org.staff).forEach(s => {
    s.item.primaryRoles.forEach(rSpec => {
      const [roleName, roleManagerEmail, roleQualifiers] = rSpec.split(/\//)

      const orgNode = org.orgStructure.getNodeByRoleName(roleName)
      // roles already verified in the first pass

      if (orgNode.getParent() !== null) {
        const roleManager = org.getStaffMember(roleManagerEmail)
        if (roleManager === undefined)
          throw new Error(`No such manager '${roleManagerEmail}' found while loading staff member '${s.getEmail()}'.`)

        s.managers[roleName] = roleManager
        roleManager.reports[roleName].push(s)
      }
    })
  })
}

export { hydrateOrg }
