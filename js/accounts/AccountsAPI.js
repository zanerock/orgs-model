import * as accounts from './Accounts'

const AccountsAPI = class {
  constructor(org) {
    this.org = org
  }

  list() { return accounts.list(this.org.innerState) }
}

export { AccountsAPI }
