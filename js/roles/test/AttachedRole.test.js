import { Organization } from '../../orgs'

describe(`AttachedRole`, () =>{
	let org
  beforeAll(() => {
    org = new Organization(
      `./js/roles/test/roles.tsv`,
      `./js/staff/test/staff.tsv`,
      `./js/orgs/test/org_structure.json`)
  })

	test(`detects invalid qualifications`, () => {
		expect(() => new Organization(`./js/roles/test/roles.tsv`,
																	`./js/staff/test/invalid_qualifier_staff.tsv`,
																	`./js/orgs/test/org_structure.json`)).
			toThrow(/non-qualifiable role.*CTO.*ceo@foo\.com/)
	})

	test.each`
  email | roleName
  ${'dev@foo.com'} | ${'Developer'}
  ${'ceo@foo.com' }| ${'CEO'}
  `(`'$email' role '$roleName' presents expected name`, ({email, roleName }) => {
    expect(org.getStaffMember(email).getAttachedRoleByName(roleName).getName()).toBe(roleName)
  })

  test.each`
  email | roleName | isQualifiable
  ${'dev@foo.com'} | ${'Developer'} | ${true}
  ${'ceo@foo.com' }| ${'CEO'} | ${false}
  `(`'$email' role '$roleName' is qualifiable: $isQualifiable`, ({email, roleName, isQualifiable }) => {
    expect(org.getStaffMember(email).getAttachedRoleByName(roleName).isQualifiable()).toBe(isQualifiable)
  })

	test.each`
  email | roleName | qualifier
  ${'uidev@foo.com'} | ${'Developer'} | ${'UI'}
	${'dev@foo.com'} | ${'Developer'} | ${null}
  ${'ceo@foo.com'} | ${'CEO'} | ${null}
  `(`'$email' role '$roleName' has '$qualifier' qualifier.`, ({email, roleName, qualifier }) => {
    expect(org.getStaffMember(email).getAttachedRoleByName(roleName).getQualifier()).toBe(qualifier)
  })
})
