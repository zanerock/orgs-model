import dotenv from 'dotenv'

import { OrgStructure } from './OrgStructure'
import { JSONLoop } from './lib/JSONLoop'

import { Roles } from '../roles'
import { Staff } from '../staff'

const Organization = class {
  constructor(dataPath, staffJsonPath, suffix = '') {
    dotenv.config({ path: `${dataPath}/orgs/settings${suffix}.sh` })

    this.dataPath = dataPath
    this.roles = new Roles(`${dataPath}/orgs/roles/roles${suffix}.json`)
    this.roles.hydrate()
    this.orgStructure = new OrgStructure(`${dataPath}/orgs/org_structure${suffix}.json`, this.roles)
    this.staff = new Staff(staffJsonPath)
    this.staff.hydrate(this)
  }

  getRoles() { return this.roles }

  getStaff() { return this.staff }

  hasStaffInRole(email, roleName) {
    return this.getStaff().getByRoleName(roleName).some(s => s.getEmail() === email)
  }

  getManagingRolesByManagedRoleName(roleName) {
    return this.orgStructure.getNodeByRoleName(roleName).getPossibleMngrs()
  }

  generateOrgChartData(style = 'debang/OrgChart') {
    if (style === 'google-chart') {
      const result = []
      // luckily, the google org chart doesn't care whetStaffher we specify the nodes in order or not, so it's a simple
      // transform
      Object.values(this.getStaff().getAll()).forEach(s => {
        s.getAttachedRoles().forEach(r => {
          if (r.isTitular()) {
            const myKey = `${s.getEmail()}/${r.getName()}`
            const manager = s.getAttachedRole(r.getName()).getManager()
            if (!manager) result.push([myKey, '', r.getQualifier()])
            else {
              const mngrEmail = manager.getEmail()
              const managingRole = this.getManagingRolesByManagedRoleName(r.getName()).find(mngrRole =>
                this.hasStaffInRole(mngrEmail, mngrRole.getName())
              )
              if (!managingRole) {
                throw new Error(`Could not find manager ${mngrEmail}/${r.getName()} for ${myKey}.`)
              }
              const managerKey = `${mngrEmail}/${managingRole.getName()}`
              result.push([myKey, managerKey, r.getQualifier()])
            }
          }
        })
      })

      return result
    }
    else if (style === 'debang/OrgChart') {
      // Converts flat/tabular (Staff, Manager) to a JSON tree, allowing for the same staff member to appear at multiple
      // notes using conversion algorithm from debang demos: https://codepen.io/dabeng/pen/mRZpLK
      const seedData = this
        .generateOrgChartData('google-chart')
        .map(row => {
          let [email, roleName] = row[0].split(/\//)
          const qualifier = row[2]
          if (qualifier) {
            roleName = roleName.replace(/^(Senior )?/, `$1${qualifier} `)
          }

          const staffMember = this.getStaff().get(email)
          return {
            id        : row[0],
            ids       : [row[0]],
            parent_id : row[1],
            email     : email,
            name      : staffMember.getFullName(),
            titles    : [roleName]
          }
        })
      var data = {}
      var childNodes = []

      seedData.forEach((item, index) => {
        if (!item.parent_id) {
          Object.assign(data, item)
        }
        else {
          var jsonloop = new JSONLoop(data, 'id', 'children')
          jsonloop.findNodeById(data, item.parent_id, function(err, node) {
            if (err) throw new Error(`Error finding '${item.parent_id}'; ${err}`)
            else {
              childNodes.push(item)
              if (node.children) {
                node.children.push(item)
              }
              else {
                node.children = [item]
              }
            }
          })
        }
      })

      // now, collapse staff member roles to same staff in parent role if only child or sub-node has no children.
      childNodes.forEach(node => {
        const jsonloop = new JSONLoop(data, 'id', 'children')
        jsonloop.findParent(data, node, (err, parent) => {
          if (err) throw new Error(`Could not find parent for '${node.id}'; is chart valid?`)

          if (parent && node.email === parent.email) {
            node.hideName = true

            if (parent.children.length === 1 || node.children === undefined) {
              parent.titles.push(...node.titles) // parent inherits collapsed node's titles
              parent.ids.push(...node.ids) // and ids
              // If 'node' is only child collapsing into parrent, just cut it out
              if (parent.children.length === 1) parent.children = node.children
              else { // Else, just cut the child out
                parent.children.splice(parent.children.findIndex((t) => t === node), 1)
              }
            }
          }
        })
      })

      return data
    }
    else throw new Error(`Org chart style '${style}' is not supported.`)
  }
}

export { Organization }
