/* globals beforeAll describe expect test */
import { Roles } from '..'

describe('Role', () => {
  let roles
  beforeAll(() => {
    roles = new Roles({}, './js/test-data/orgs/roles/roles.json').hydrate()
  })

  test.each`
  roleName | isQualifiable
  ${'Developer'} | ${true}
  ${'CEO'} | ${false}
  `('Role \'$roleName\' is qualifiable: $isQualifiable', ({ roleName, isQualifiable }) =>
  expect(roles.get(roleName).isQualifiable()).toBe(isQualifiable)
)
})
