/* globals beforeAll describe expect test */
import { Roles } from '..'

describe('Roles', () => {
  let testRoles
  beforeAll(() => {
    testRoles = new Roles('./js/roles/test/roles.tsv').hydrate()
  })

  test('parses test file', () => {
    expect(testRoles).toBeTruthy()
    expect(testRoles.getAll()).toHaveLength(6)
  })

  test('properly sets fields', () => expect(testRoles.getAll()[0].getName()).toBe('CEO'))
})
