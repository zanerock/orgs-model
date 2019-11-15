import { Policies } from './policies'

describe(`Policies`, () => {
	test('addSourceFile remembers sources', () => {
    const policies = new Policies()
    const testPath = testPath
    policies.addSourceFile(testPath)
    expect(policies.sourceFiles).toHaveLength(1)
    expect(policies.sourceFiles[0]).toBe(testPath)
  })
})
