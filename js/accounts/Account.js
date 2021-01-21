const Account = class {
  constructor(name, data) {
    Object.assign(this, { name }, data)
  }

  getName() { return this.name }

  getAccessType() { return this['access-type'] }

  getRegisteredId() { return this['registered-id'] }

  getEmails() { return this.emails }
}

export { Account }
