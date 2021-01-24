/**
* Basic methods for accessing the accounts data.
*/

/**
* Retrieves a single account entry by name.
*/
const get = (data, name) => data?.thirdPartyAccounts?.[name] && toStandalone(data, name)

const list = (data) => Object.keys(data?.thirdPartyAccounts || {}).sort().map((key) => toStandalone(data, key))

// helper/non-exported items
/**
* Creates a new/copy of the account data with an additional 'name' field. The name should be the key value which
* pointed to the account data.
*/
const toStandalone = (data, name) => Object.assign({}, data.thirdPartyAccounts[name], { name })

export { get, list }
