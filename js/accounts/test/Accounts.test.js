/* global beforeAll describe expect test */

import * as accounts from '../Accounts'
import { loadOrgState } from '../../lib/org-state'

describe('Account', () => {
  var orgState
  beforeAll(() => { orgState = loadOrgState('./js/test-data') })

  describe('get', () => {
    test('retrieves account by name', () => {
      const acct = accounts.get(orgState, 'networks/acme-co')
      expect(acct).not.toBeNull()
      expect(acct.getName()).toBe('networks/acme-co')
      expect(acct.getAccessType()).toBe('group')
    })

    test('returns null for unknown account', () => {
      expect(accounts.get(orgState, 'no-such-account')).toBeUndefined()
    })
  })

  describe('list', () => {
    test('lists account names', () => {
      const acctsList = accounts.list(orgState)
      expect(acctsList.length).toBe(1)
      expect(acctsList[0].getName()).toBe('networks/acme-co')
    })
  })
})
