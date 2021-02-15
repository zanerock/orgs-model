import * as fs from 'fs'

import { Evaluator } from '@liquid-labs/condition-eval'

import { StaffMember } from './StaffMember'
import { AttachedRole } from '../roles'

const roleRe = new RegExp('^HAS_[A-Z_]+_ROLE$')
const staffParameters = ['USES_CENTRALIZED_ANTIVIRUS', 'USES_CENTRALIZED_FIREWALL']
const zeroRes = staffParameters.map(p => new RegExp(p))
zeroRes.push(roleRe)

const Staff = class {
  constructor(fileName) {
    this.fileName = fileName
    const data = JSON.parse(fs.readFileSync(fileName))
    this.members = data.map((rec) => new StaffMember(rec))
    this.map = this.members.reduce((acc, member, i) => {
      if (acc[member.getEmail()] !== undefined) {
        throw new Error(`Staff member with email '${member.getEmail()}' already exists at entry ${i}.`)
      }
      acc[member.getEmail()] = member
      return acc
    }, {})

    this.checkCondition = checkCondition

    this.key = 'email'
  }

  // TODO: depracated
  getAll() { return this.members.slice() }
  list() { return this.members.slice() }

  get(email) { return this.map[email] }

  getByRoleName(roleName) { return this.members.filter(s => s.hasRole(roleName)) }

  addData(memberData) {
    console.log('Staff: ', memberData)
    this.members.push(new StaffMember(memberData))
    this.hydrate(this.org)
  }

  remove(email) {
    email = email.toLowerCase()
    const matches = this.getAll().filter(member => member.email === email)

    if (matches.length === 0) {
      throw new Error(`Could not find staff member with email ${email}.`)
    }
    else if (matches.length > 1) {
      throw new Error(`Staff database consistency error. Found multiple entires for '${email}'.`)
    }

    this.members = this.members.filter(member => member.email !== email)
  }

  write() { fs.writeFileSync(this.fileName, this.toString()) }

  /**
   * Swaps out references to roles and managers by name and email (respectively) with the actual role and manager
   * objects.
   */
  hydrate(org) {
    this.org = org

    this.members.forEach((s) => {
      s.roles = s.roles.map((rec) => { // Yes, both maps AND has side effects. Suck it!
        if (rec instanceof AttachedRole) return rec
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
    const flatJson = this.members.map((s) => {
      const data = {
        email            : s.getEmail(),
        familyName       : s.getFamilyName(),
        givenName        : s.getGivenName(),
        startDate        : s.getStartDate(),
        roles            : [],
        employmentStatus : s.getEmploymentStatus(),
        parameters       : s.getParameters()
      }
      s.roles.forEach((attachedRole) => {
        const roleData = { name : attachedRole.getName() }
        if (attachedRole.getManager()) { roleData.manager = attachedRole.getManager().getEmail() }
        if (attachedRole.getQualifier()) { roleData.qualifier = attachedRole.getQualifier() }
        if (attachedRole.isActing()) { roleData.acting = attachedRole.isActing() }

        data.roles.push(roleData)
      })

      return data
    })

    return JSON.stringify(flatJson, null, '  ')
  }
}

/**
* Obligitory 'checkCondition' function provided by the API for processing inclusion or exclusion of Staff targets in
* an audit.
*/
const checkCondition = (condition, member) => {
  const parameters = Object.assign(
    {
      SEC_TRIVIAL : 1,
      ALWAYS      : 1,
      NEVER       : 0
    },
    member.parameters)

  // TODO: test if leaving it 'true'/'false' works.
  parameters.IS_EMPLOYEE = member.getEmploymentStatus() === 'employee' ? 1 : 0
  parameters.IS_CONTRACTOR = member.getEmploymentStatus() === 'contractor' ? 1 : 0

  member.getRoleNames().forEach(role => {
    parameters[`HAS_${role.toUpperCase().replace(/ /g, '_')}_ROLE`] = 1
  })

  const evaluator = new Evaluator({ parameters, zeroRes })
  return evaluator.evalTruth(condition)
}

export { Staff }
