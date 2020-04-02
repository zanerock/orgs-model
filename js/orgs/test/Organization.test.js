import { Organization } from '../'
import { StaffTsv } from '../../staff'

describe('Organization', () => {
  let org
  beforeAll(() => {
    org = new Organization(
      `./js/roles/test/roles.tsv`,
      `./js/staff/test/staff.tsv`,
      `./js/orgs/test/org_structure.json`)
  })

  test(`detects staff with invalid roles`, () => {
    expect(() =>
      new Organization(
        `./js/roles/test/roles.tsv`,
        `./js/staff/test/bad_role_staff.tsv`,
        `./js/orgs/test/org_structure.json`)).
      toThrow(/badrole@foo\.com.*Bad Role/)
  })

  test(`detects staff with invalid manaagers`, () => {
    expect(() =>
      new Organization(
        `./js/roles/test/roles.tsv`,
        `./js/staff/test/bad_manager_staff.tsv`,
        `./js/orgs/test/org_structure.json`)).
      toThrow(/nosuchmngr@foo\.com.*badmanager@foo\.com/)
  })

  test(`successfully initializes with good data`, () => expect(org).not.toBe(undefined))

  test(`loads basic staff data`, () => {
    let ceo = org.getStaffMember('ceo@foo.com')
    expect(ceo).not.toBe(undefined)
    expect(ceo.getGivenName()).toEqual('CEO')
  })

  test(`loads basic role data`, () => {
    let role = org.getRole('CTO')
    expect(role).not.toBe(undefined)
    expect(role.getName()).toEqual('CTO')
  })

  describe(`hydrates org chart`, () => {
    test.each`
    email | roleName | managerEmail
    ${'ceo@foo.com'} | ${'CTO'} | ${'ceo@foo.com'}
    ${'dev@foo.com'} | ${'Developer'} | ${'ceo@foo.com'}
    `(`$email as $roleName managed by $managerName`, ({email, roleName, managerEmail}) => {
      expect(org.getStaffMember(email).getManagerByRoleName(roleName).getEmail()).toEqual(managerEmail)
    })

    test.each`
    managerEmail | roleName | reportCount
    ${'ceo@foo.com'} | ${'Developer'} | ${2}
    ${'ceo@foo.com'} | ${'Tester'} | ${1}
    `(`$managerEamil manages $reportCount $roleName staff`, ({managerEmail, roleName, managerName, reportCount}) => {
      expect(org.getStaffMember(managerEmail).getReportsByRoleName(roleName)).toHaveLength(reportCount)
    })

    test.each`
    email | reportCount
    ${'ceo@foo.com'} | ${3}
    ${'dev@foo.com'} | ${0}
    `(`$email has $reportCount total reports`, ({email, roleName, managerName, reportCount}) => {
      expect(org.getStaffMember(email).getReports()).toHaveLength(reportCount)
    })
  })

  describe(`getStaffByRoleName`, () => {
    test(`returns array of staff matching role`, () => {
      const staff = org.getStaffByRoleName('Developer')
      expect(staff).toHaveLength(2)
      expect(staff.findIndex(s => s.getEmail() === 'dev@foo.com')).not.toEqual(-1)
      expect(staff.findIndex(s => s.getEmail() === 'uidev@foo.com')).not.toEqual(-1)
    })

    test(`returns empty array with no matching staff`, () => expect(org.getStaffByRoleName('blah')).toEqual([]))
  })

  describe('generateOrgChartData', () => {
    test(`for debang/OrgChart`, () => {
      // console.log(JSON.stringify(org.generateOrgChartData('debang/OrgChart')))
      const expected = {"id":"ceo@foo.com/CEO","name":"CEO Foo","title":"CEO","children":[{"id":"ceo@foo.com/CTO","name":"CEO Foo","title":"CTO","children":[{"id":"dev@foo.com/Developer","name":"Dev Bar","title":"Developer"},{"id":"uidev@foo.com/Developer","name":"UI Bar","title":"Developer"},{"id":"test@foo.com/Tester","name":"Test Baz","title":"Tester"}]}]}
      expect(org.generateOrgChartData('debang/OrgChart')).toEqual(expected)
    })

    test(`for GoogleCharts org chart`, () => {
      // console.log(JSON.stringify(org.generateOrgChartData('google-chart')))
      const expected = [["ceo@foo.com/CEO",""],["ceo@foo.com/CTO","ceo@foo.com/CEO"],["dev@foo.com/Developer","ceo@foo.com/CTO"],["uidev@foo.com/Developer","ceo@foo.com/CTO"],["test@foo.com/Tester","ceo@foo.com/CTO"]]
      expect(org.generateOrgChartData('google-chart')).toEqual(expected)
    })

    test(`raises exception when presented with unknown chart style`, () => {
      expect(() => org.generateOrgChartData('blah')).toThrow(/blah.*is not supported/i)
    })
  })
})
