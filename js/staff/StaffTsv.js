import { StaffMember } from './StaffMember'

import { TsvExt } from '../lib'

const StaffTsv = class extends TsvExt {
  static headers = [ 'Email', 'Family Name', 'Given Name', 'Start Date', 'Primary Roles', 'Secondary Roles', 'Employment Status' ]
  static keys = [ 'email', 'familyName', 'givenName', 'startDate', 'primaryRoles', 'secondaryRoles', 'employmentStatus' ]
  static multis = { 'primaryRoles' : true, 'secondaryRoles' : true, 'managers' : true }

	constructor(fileName) {
    super(StaffTsv.headers, StaffTsv.keys, fileName, StaffTsv.multis)
	}

  matchKey = (line, key) => line[0] === key

  init() {
    return this.getItems().reduce(
			(staff, item) => {
        if (staff[item.email] !== undefined)
          throw new Error(`member with email '${item.email}' already exists at entry ${item._pos + 1}.`)
				staff[item.email] = new StaffMember(item)
				return staff
			}, {})
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
          throw new Error(`Staff member '${s.getEmail()}' claims non-existent role '${roleName}'.`)

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
}

export { StaffTsv }
