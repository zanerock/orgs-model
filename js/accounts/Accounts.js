import { Account } from './Account'

const get = (data, name) => data?.thirdPartyAccounts?.[name] && new Account(name, data.thirdPartyAccounts[name])

const list = (data) =>
  Object.keys(data?.thirdPartyAccounts || {})
    .map((key) => new Account(key, data.thirdPartyAccounts[key]))

export { get, list }
