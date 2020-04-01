const Organization = class {
  constructor(rolesTsv, staffTsv, orgStructure) {
    this.staff = []

    // let's hydrate
    staffTsv.reset()
    let s; while ((s = this.next()) !== undefined) {
      staff.push(new Staff(s))
    }

    staff.forEach(s => { // initialize the structural data
      s.item.roles.forEach(rSpec => {
        const [roleName] = rSpec.split(/\//)
        orgStructure.getRole(roleName)
      })
    })
    /*
    staff.forEach(s => {
      s.item.roles.forEach(rSpec => {
        const [roleName, roleManagerEmail, roleQualifiers] = rSpec.split(/\//)

        const roleItem = rolesTsv.find(roleName)
        if (roleDef === undefined)
          throw new Error(`No such role '${r}' defined for organization while loading staff member '${s.getEmail()}'.`);

        const roleManager = staff.find(s => s.getEmail() === roleManagerEmail)
        if (roleManager === undefined)
          throw new Error(`No such manager '${roleManagerEmail}' found while loading staff member '${s.getEmail()}'.`)

        staff.roles.push(roleItem)
        staff.managers[roleName] = roleManager
      })
    })*/
  }
}

export { Organization }
