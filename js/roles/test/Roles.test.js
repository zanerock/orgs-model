/* globals beforeAll describe expect test */
import { Roles } from '..'

describe('Roles', () => {
  let testRoles
  beforeAll(() => {
    testRoles = new Roles('./js/test-data/orgs/roles/roles.json').hydrate()
  })

  test('parses test file', () => {
    expect(testRoles).toBeTruthy()
    expect(testRoles.getAll()).toHaveLength(6)
  })

  test('properly sets fields', () => expect(testRoles.getAll()[0].getName()).toBe('CEO'))
})
