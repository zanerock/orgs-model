/* global beforeAll describe expect test */

import * as accounts from '../Accounts'
import { loadOrgState } from '../../lib/org-state'

describe('Account', () => {
  var orgState
  beforeAll(() => { orgState = loadOrgState('./js/test-data') })

  describe('get', () => {
    test('retrieves account by name', () => {
      const acct = accounts.get(orgState, 'networks/acme-co')
      expect(acct).toBeTruthy()
      expect(acct.id).toBe('acmeadmin@test-company.com')
      expect(acct.name).toBe('networks/acme-co')
    })

    test('returns undefined for unknown account', () => {
      expect(accounts.get(orgState, 'no-such-account')).toBeUndefined()
    })
  })

  describe('list', () => {
    var acctList
    beforeAll(() => { acctList = accounts.list(orgState) })

    test('retrieves all accounts by default', () => expect(acctList.length).toBe(2))

    test('initializes member data with name', () => {
      const acct = acctList.find((el) => el.name === 'networks/acme-co')
      expect(acct).toBeTruthy()
      expect(acct.name).toBe('networks/acme-co')
    })

    test('produces sorted results', () => {
      const names = acctList.map((acct) => acct.name)
      expect(names).toEqual(names.sort())
    })
  })
})
