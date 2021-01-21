import * as accounts from './Accounts'

const AccountsAPI = class {
  constructor(org) {
    this.org = org
  }

  list() {
    accounts.list(this.org.innerState)
  }
}

export { AccountsAPI }
