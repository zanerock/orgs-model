import { AccountsAPI } from '../AccountsAPI'
import { Organization } from '../../orgs/Organization'

describe('AccountsAPI', () => {
  var acctsAPI
  beforeAll(() => {
    const org = new Organization('./js/test-data', './js/staff/test/staff.json')
    acctsAPI = new AccountsAPI(org)
  })

  describe('checkCondition', () => {
    var acctList
    beforeAll(() => { acctList = acctsAPI.list() })

    test.each`
      desc | condition | expectation
      ${'existential sensitivity'} | ${'SENSITIVITY == EXISTENTIAL'} | ${['networks/acme-co']}
    `('properly evaluates $desc ($condition)', ({ desc, condition, expectation }) => {
      const accts = acctList.filter((acct) => AccountsAPI.checkCondition(condition, acct))
      expect(accts.map(e => e.name)).toEqual(expectation)
    })
  })
})
