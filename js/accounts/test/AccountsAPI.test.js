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
      ${'greater than none'}|${'SENSITIVITY > NONE'}|${['business/fax-co','networks/acme-co']}
      ${'parameter tags'}|${'BUSINESS'}|${['business/fax-co']}
      ${'parameter numbers'}|${'REVIEW_PERIOD == 360'}|${['business/fax-co']}
    `('properly evaluates $desc ($condition)', ({ desc, condition, expectation }) => {
      const accts = acctList.filter((acct) => AccountsAPI.checkCondition(condition, acct))
      expect(accts.map(e => e.name)).toEqual(expectation)
    })

    test('complains of unknown parameters', () =>
      expect(() => AccountsAPI.checkCondition('BLAH', acctList[0]))
        .toThrow(/'BLAH' is not defined/)
    )

    test('complains of complicated condition', () =>
      expect(() => AccountsAPI.checkCondition('exit()', acctList[0]))
        .toThrow(/unsafe code/)
    )
  })
})
