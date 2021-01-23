/* global beforeAll describe expect test */

import * as accounts from '../Accounts'
import { loadOrgState } from '../../lib/org-state'

describe('Account', () => {
  var orgState
  beforeAll(() => { orgState = loadOrgState('./js/test-data') })

  describe('list', () => {
    test('lists account names', () => {
      const acctsList = accounts.list(orgState)
      expect(acctsList.length).toBe(1)
      expect(acctsList[0].getName()).toBe('networks/acme-co')
    })
  })
})
