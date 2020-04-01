import { OrgStructure } from './OrgStructure'

import { RolesTsv } from '../roles'
import { StaffTsv } from '../staff'
import * as setup from './lib/org-setup'

const Organization = class {
  // TODO: it should logically be roles, orgStruct, staff
  constructor(rolesTsvPath, staffTsvPath, orgStructurePath) {
    this.roles = new RolesTsv(rolesTsvPath).hydrate()
    this.staff = new StaffTsv(staffTsvPath).hydrate()
    this.orgStructure = new OrgStructure(orgStructurePath, this.roles)

    setup.hydrateOrg(this)
  }

  getStaffMember(email) { return this.staff[email] }

  getRole(name) { return this.roles[name] }
}

export { Organization }
