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
    test('retrieves all known accounts by default', () => {
      const acctsList = accounts.list(orgState)
      expect(acctsList.length).toBe(1)
      const acct0 = acctsList.find((el) => el.name === 'networks/acme-co')
      expect(acct0).toBeTruthy()
      expect(acct0.name).toBe('networks/acme-co')
    })
  })
})
