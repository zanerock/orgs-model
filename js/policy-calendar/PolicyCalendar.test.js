/* globals beforeAll describe expect test */
import { PolicyCalendar } from './PolicyCalendar'

describe('PolicyCalendar', () => {
  let testPolicyCalendar
  beforeAll(() => {
    testPolicyCalendar = new PolicyCalendar('./js/policy-calendar/test_data.tsv')
  })

  test('parses test file', () => expect(testPolicyCalendar).toBeTruthy())

  test('ignore blank lines', () => expect(testPolicyCalendar.length).toBe(4))

  test('properly sets fields', () => {
    const item = testPolicyCalendar.getItems()[0]
    expect(item.itemName).toBe('Annual thing.')
  })
})
