import { Account } from './Account'

const list = (data) =>
  Object.keys(data?.thirdPartyAccounts || {})
    .map((key) => new Account(key, data.thirdPartyAccounts[key]))

export { list }
