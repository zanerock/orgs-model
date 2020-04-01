import { OrgStructure } from './OrgStructure'

import { RolesTsv } from '../roles'
import { Staff, StaffTsv } from '../staff'

const Organization = class {
  constructor(rolesTsvPath, staffTsvPath, orgStructurePath) {
    this.roles = new RolesTsv(rolesTsvPath).hydrate()
    this.orgStructure = new OrgStructure(orgStructurePath, this.roles)
    this.staff = new StaffTsv(staffTsvPath).init(this)
    Staff.hydrate(this)
  }

  getStaffMember(email) { return this.staff[email] }

  getRole(name) { return this.roles[name] }
}

export { Organization }
