/* globals beforeAll describe expect test */
import { Organization } from '../../orgs'

describe('StaffMember', () => {
  let org
  beforeAll(() => {
    org = new Organization(
      './js/roles/test/roles.tsv',
      './js/staff/test/staff.tsv',
      './js/orgs/test/org_structure.json')
  })

  test.each`
  email | roleName | isActing
  ${'ceo@foo.com'} | ${'CTO'} | ${true}
  ${'ceo@foo.com'} | ${'CEO'} | ${false}
  ${'dev@foo.com'} | ${'Developer'} | ${false}
  `('$email is acting in $roleName : $isActing', ({ email, roleName, isActing }) =>
  expect(org.getStaff().get(email).getAttachedRole(roleName).isActing()).toBe(isActing)
)
})
