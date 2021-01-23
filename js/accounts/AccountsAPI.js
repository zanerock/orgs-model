import * as accounts from './Accounts'

const AccountsAPI = class {
  constructor(org) {
    this.org = org
  }

  get(name) { return accounts.get(this.org.innerState, name) }

  list() { return accounts.list(this.org.innerState) }
}

export { AccountsAPI }
