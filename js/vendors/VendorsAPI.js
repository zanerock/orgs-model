import { Evaluator } from '@liquid-labs/condition-eval'

import * as vendors from './Vendors'

/**
* Public API for managing vendor/product records. Uses the `Vendors` library, which actually implements the functions.
* The library is split like this to make testing easier.
*/
const VendorsAPI = class {
  constructor(org) {
    this.org = org
    this.checkCondition = VendorsAPI.checkCondition

    this.key = 'name'
  }

  get(name) { return accounts.get(this.org.innerState, name) }

  list() { return accounts.list(this.org.innerState) }
}

/**
* Obligitory 'checkCondition' function provided by the API for processing inclusion or exclusion of Account targets in
* an audit. We do this weird 'defineProperty' thing because it effectively gives us a 'static const'
*/
const checkCondition = (condition, productRec) => {
  const parameters = Object.assign(
    {
      SEC_TRIVIAL : 1,
      ALWAYS      : 1,
      NEVER       : 0,
      NONE        : 0,
      LOW         : 1,
      MODERATE    : 2,
      HIGH        : 3,
      EXISTENTIAL : 4
    },
    productRec.parameters
  )

  // TODO: create a handly conversion class/lib for the sensitivity codes; SensitivityCode?
  const sensitivityCode = acct.sensitivityApproval || 'Quarantined Only'

  switch (sensitivityCode) {
  case 'Top Secret Use':
    parameters.SENSITIVITY = 0; break
  case 'Secret Use':
    parameters.SENSITIVITY = 1; break
  case 'Sensitive Use':
    parameters.SENSITIVITY = 2; break
  case 'General Use':
    parameters.SENSITIVITY = 3; break
  case 'Quarantined Only':
    parameters.SENSITIVITY = 4; break
  default:
    throw new Error(`Unknown sensitivity approval code: '${sensitivityCode}'.`)
  }

  // configure the non-existent tags to 'zero' out
  // const zeroRes = [/BUSINESS|NETWORKING/]
  const zeroRes = []

  const evaluator = new Evaluator({ parameters, zeroRes })
  return evaluator.evalTruth(condition)
}

Object.defineProperty(VendorsAPI, 'checkCondition', {
  value        : checkCondition,
  writable     : false,
  enumerable   : true,
  configurable : false
})

export { VendorsAPI }
