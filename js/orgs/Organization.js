import { OrgStructure } from './OrgStructure'
import { JSONLoop } from './lib/JSONLoop'

import { RolesTsv } from '../roles'
import { Staff, StaffTsv } from '../staff'

const Organization = class {
  constructor(rolesTsvPath, staffTsvPath, orgStructurePath) {
    this.roles = new RolesTsv(rolesTsvPath).hydrate()
    this.orgStructure = new OrgStructure(orgStructurePath, this.roles)
    this.staff = new StaffTsv(staffTsvPath).init(this)
    Staff.hydrate(this)
  }

  getRole(name) { return this.roles[name] }

  getStaffMember(email) { return this.staff[email] }

  getStaffByRoleName(roleName) { return Object.values(this.staff).filter(s => s.hasRole(roleName)) }

  hasStaffInRole(email, roleName) {
    return this.getStaffByRoleName(roleName).some(s => s.getEmail() === email)
  }

  getManagingRolesByManagedRoleName(roleName) {
    return this.orgStructure.getNodeByRoleName(roleName).getPossibleMngrs()
  }

  generateOrgChartData(style='debang/OrgChart') {
    if (style === 'google-chart') {
      const result = []
      // luckily, the google org chart doesn't care whether we specify the nodes in order or not, so it's a simple
      // transform
      Object.values(this.staff).forEach(s => {
        s.getAttachedRoles().forEach(r => {
          const myKey = `${s.getEmail()}/${r.getName()}`
          const manager = s.getManagerByRoleName(r.getName())
          if (!manager) result.push([myKey, ''])
          else {
            const mngrEmail = manager.getEmail()
            const managingRole = this.getManagingRolesByManagedRoleName(r.getName()).find(mngrRole =>
              this.hasStaffInRole(mngrEmail, mngrRole.getName())
            )
            if (!managingRole) throw new Error(`Could not find manager ${mngrEmail}/${r.getName()}`)
            const managerKey = `${mngrEmail}/${managingRole.getName()}`
            result.push([myKey, managerKey])
          }
        })
      })

      return result
    }
    else if (style === 'debang/OrgChart') {
      // Converts flat/tabular (Staff, Manager) to a JSON tree, allowing for the same staff member to appear at multiple
      // notes using conversion algorithm from debang demos: https://codepen.io/dabeng/pen/mRZpLK
      const seedData = this.
        generateOrgChartData('google-chart').
        map(row => {
          const [ email, roleName ] = row[0].split(/\//)
          const staffMember = this.getStaffMember(email)
          return {
            id: row[0],
            ids: [row[0]],
            parent_id: row[1],
            email: email,
            name: staffMember.getFullName(),
            titles: [roleName]
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
                var b = 2;
              }
              else {
                node.children = [ item ]
                var a = 1
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
