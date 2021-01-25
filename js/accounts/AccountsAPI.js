import * as accounts from './Accounts'

const AccountsAPI = class {
  constructor(org) {
    this.org = org
  }

  get(name) { return accounts.get(this.org.innerState, name) }

  list() { return accounts.list(this.org.innerState) }
}

/**
* Obligitory 'checkCondition' function provided by the API for processing inclusion or exclusion of Account targets in
* an audit. We do this weird 'defineProperty' thing because it effectively gives us a 'static const'
*/
const checkCondition = (condition, acct) => {
  const parameters = Object.assign(
    {
      SEC_TRIVIAL : 1,
      ALWAYS      : 1,
      NEVER       : 0
    },
    acct.parameters)

  const evaluator = new Evaluator({ parameters, zeroRes })
  return evaluator.evalTruth(condition)
}

Object.defineProperty(AccountsAPI, 'checkCondition', {
    value: checkCondition,
    writable : false,
    enumerable : true,
    configurable : false
})

export { AccountsAPI }
