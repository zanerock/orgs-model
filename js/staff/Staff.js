import * as fs from 'fs'

import { Evaluator } from '@liquid-labs/condition-eval'

import { StaffMember } from './StaffMember'
import { AttachedRole } from '../roles'

const roleRe = new RegExp('^HAS_[A-Z_]+_ROLE$')

const Staff = class {
  constructor(fileName) {
    const data = JSON.parse(fs.readFileSync(fileName))
    this.list = data.map((rec) => new StaffMember(rec))
    this.map = this.list.reduce((acc, member, i) => {
      if (acc[member.getEmail()] !== undefined) {
        throw new Error(`Staff member with email '${member.getEmail()}' already exists at entry ${i}.`)
      }
      acc[member.getEmail()] = member
      return acc
    }, {})
  }

  getAll() { return this.list.slice() }

  get(email) { return this.map[email] }

  getByRoleName(roleName) { return this.list.filter(s => s.hasRole(roleName)) }

  staffByCondition(condition){
    const selectedStaff = []

    this.getAll().forEach((member) => {
      const parameters = {
        SEC_TRIVIAL : 1,
        ALWAYS      : 1,
        NEVER       : 0
      }

      // TODO: test if leaving it 'true'/'false' works.
      parameters.IS_EMPLOYEE = member.getEmploymentStatus() === 'employee' ? 1 : 0
      parameters.IS_CONTRACTOR = member.getEmploymentStatus() === 'contractor' ? 1 : 0

      member.getRoleNames().forEach(role =>
        parameters[`HAS_${role.toUpperCase().replace(/ /, '_')}_ROLE`] = 1
      )

      const evaluator = new Evaluator({ parameters: parameters, zerosRes: [roleRe]})

      if (evaluator.evalTruth(condition)) {
        selectedStaff.push(member)
      }
    })

    return selectedStaff
  }

  /**
   * Swaps out references to roles and managers by name and email (respectively) with the actual role and manager
   * objects.
   */
  hydrate(org) {
    this.org = org

    this.list.forEach((s) => {
      s.roles = s.roles.map((rec) => { // Yes, both maps AND has side effects. Suck it!
        // Verify rec references a good role. Note, we check the 'orgStructure' because there may be a role defined
        // globally that isn't in use in the org.
        const role = org.getRoles().get(rec.name)
        if (role === undefined) {
          throw new Error(`Staff member '${s.getEmail()}' claims unknown role '${rec.name}'.`)
        }
        if (role.isTitular()) {
          const orgNode = org.orgStructure.getNodeByRoleName(rec.name)
          if (orgNode === undefined) {
            throw new Error(`Staff member '${s.getEmail()}' claims role '${rec.name}' not used in this org.`)
          }
          // TODO: check the prim manager from the org structure persective
          // orgNode.getPrimMngr() !== null
        }

        let roleManager = null
        if (rec.manager) {
          // Then replace manager ID with manager object and add ourselves to their reports
          roleManager = org.getStaff().get(rec.manager)
          if (roleManager === undefined) {
            throw new Error(`No such manager '${rec.manager}' found while loading staff member '${s.getEmail()}'.`)
          }

          // Add ourselves to the manager's reports
          if (roleManager.reportsByReportRole[role.name] === undefined) {
            roleManager.reportsByReportRole[role.name] = []
          }
          roleManager.reportsByReportRole[role.name].push(s)
        }

        const attachedRole = new AttachedRole(role, rec, roleManager, s)
        s.attachedRolesByName[role.name] = attachedRole
        return attachedRole
      }) // StaffMember roles map
    }) // StaffMember iteration

    return this
  }

  /**
  * Returns the JSON string of the de-hydrated data structure.
  */
  toString() {
    const flatJson = this.list.map((s) => {
      const data = {
        email: s.getEmail(),
        familyName: s.getFamilyName(),
        givenName: s.getGivenName(),
        startDate: s.getStartDate(),
        roles: [],
        employmentStatus: s.getEmploymentStatus()
      }
      s.roles.forEach((attachedRole) => {
        const roleData = { name: attachedRole.getName() }
        if (attachedRole.getManager()) { roleData.manager = attachedRole.getManager().getEmail() }
        if (attachedRole.getQualifier()) { roleData.qualifier = attachedRole.getQualifier() }
        if (attachedRole.isActing()) { roleData.acting=  attachedRole.isActing() }

        data.roles.push(roleData)
      })

      return data
    })

    return JSON.stringify(flatJson)
  }
}

export { Staff }
