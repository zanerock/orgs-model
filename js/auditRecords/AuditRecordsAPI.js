import { Evaluator } from '@liquid-labs/condition-eval'

import * as auditRecords from './AuditRecords'

/**
* Public API for managing third-party account records. Uses the `Accounts` library, which actually implements the
* functions. The library is split like this to make testing easier.
*/
const AuditRecordsAPI = class {
  constructor(org) {
    this.org = org
    this.checkCondition = AuditRecordsAPI.checkCondition

    this.key = 'id'
  }

  get(id) { return auditRecords.get(this.org.innerState, id) }

  list(options) { return auditRecords.list(this.org.innerState, options) }

  persist(options) { return auditRecords.persist(this.org.innerState, options) }

  update(auditRecord) { return auditRecords.update(this.org.innerState, auditRecord) }
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

  const evaluator = new Evaluator({ parameters, zeroRes })
  return evaluator.evalTruth(condition)
}

Object.defineProperty(AuditRecordsAPI, 'checkCondition', {
  value        : checkCondition,
  writable     : false,
  enumerable   : true,
  configurable : false
})

export { AuditRecordsAPI }
