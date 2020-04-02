import { RolesTsv } from '..'

describe(`Role`, () =>{
	let roles
  beforeAll(() => {
    roles = new RolesTsv(`./js/roles/test/roles.tsv`).hydrate()
  })

  test.each`
  roleName | isQualifiable
  ${'Developer'} | ${true}
  ${'CEO'} | ${false}
  `(`Role '$roleName' is qualifiable: $isQualifiable`, ({roleName, isQualifiable }) =>
    expect(roles[roleName].isQualifiable()).toBe(isQualifiable)
  )
})
