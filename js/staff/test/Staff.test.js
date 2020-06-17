/* globals beforeAll describe expect test */
import * as fs from 'fs'

import { Staff } from '../Staff'
import { Organization } from '../../orgs'

describe('Staff', () => {
  let testStaff
  beforeAll(() => {
    const org = new Organization(
      './js/roles/test/roles.tsv',
      './js/staff/test/staff.tsv',
      './js/orgs/test/org_structure.json')
    // TODO: the way we end up hydrating kinda breaks unit test isolation?
    testStaff = org.getStaff()
  })

  test('detects duplicate emails on init', () =>
    expect(() => new Staff('./js/staff/test/dupe_email_staff.tsv').init())
      .toThrow(/email.*ceo@foo.com/))

  test('filters header+blank lines', () => expect(testStaff.getAll()).toHaveLength(4))

  test('fields', () => {
    const ceo = testStaff.getAll()[0]
    expect(ceo.getEmail()).toBe('ceo@foo.com')
    expect(ceo.getAttachedRoles()).toHaveLength(2)
    const ceoRole = ceo.getAttachedRoles()[0]
    expect(ceoRole.getName()).toBe('CEO')
    expect(ceoRole.getManager()).toBeNull()
    expect(ceoRole.isActing()).toBe(false)
    const ctoRole = ceo.getAttachedRoles()[1]
    expect(ctoRole.getName()).toBe('CTO')
    expect(ctoRole.getManager().getEmail()).toBe('ceo@foo.com')
    expect(ctoRole.isActing()).toBe(true)
    expect(ceo.getEmploymentStatus()).toEqual('employee')
    const dev = testStaff.getAll()[1]
    expect(dev.getAttachedRoles()[0].getName()).toBe('Developer')
    expect(dev.getAttachedRoles()[0].getManager().getEmail()).toBe('ceo@foo.com')
  })

  test('writes as expected', () => {
    const out = testStaff.toString()
    // console.log(out)
    const data = JSON.parse(out)
    const expected = JSON.parse(fs.readFileSync('./js/staff/test/staff.tsv'))

    expect(data).toEqual(expected)
  })
})
