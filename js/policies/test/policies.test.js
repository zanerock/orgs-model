import { Policies } from '..'

describe(`Policies`, () => {
	test('addSourceFile remembers sources', () => {
    const policies = new Policies()
    const testPath = testPath
    policies.addSourceFile(testPath)
    expect(policies.sourceFiles).toHaveLength(1)
    expect(policies.sourceFiles[0]).toBe(testPath)
  })

  test('can get Roles', () => {
    const policies = new Policies()
    policies.setRolesFile('roles.tsv')
    policies.addSourceFile('./js/roles/test/roles.tsv')
    const roles = policies.getRoles()
    expect(roles.data).toHaveLength(4)
  })
})
