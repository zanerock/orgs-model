import { Evaluator } from '@liquid-labs/condition-eval'

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
      NEVER       : 0,
      NONE:0,
      LOW:1,
      MODERATE:2,
      HIGH:3,
      EXISTENTIAL:4
    },
    acct.parameters
  )

  // TODO: create a handly conversion class/lib for the sensitivity codes; SensitivityCode?
  const sensitivityCode = acct.sensitivity || 'EXISTENTIAL'

  switch (sensitivityCode) {
    case "NONE":
      parameters.SENSITIVITY = 0; break;
    case "LOW":
      parameters.SENSITIVITY = 1; break;
    case "MODERATE":
      parameters.SENSITIVITY = 2; break;
    case "HIGH":
      parameters.SENSITIVITY = 3; break;
    case "EXISTENTIAL":
      parameters.SENSITIVITY = 4; break;
    default:
      throw new Error(`Unknown sensitivity code: '${sensitivityCode}'.`)
  }

  // configure the non-existent tags to 'zero' out
  const zeroRes = [ /BUSINESS|NETWORKING/ ]

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
