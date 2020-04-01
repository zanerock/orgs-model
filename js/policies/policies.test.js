import { Policies } from './policies'

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
    policies.setRolesFile('test_data.tsv')
    policies.addSourceFile('./js/roles/test_data.tsv')
    const roles = policies.getRoles()
    expect(roles.data).toHaveLength(4)
  })
})
