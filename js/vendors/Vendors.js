/**
* Basic methods for accessing the vendors/product data. Note that functionality is split up like this to make these
* functions easier to unit test.
*/

/**
* Retrieves a single vendor/product entry by name.
*/
const get = (data, name) => data?.vendors?.[name] && toStandalone(data, name)

const list = (data) => Object.keys(data?.vendors || {}).sort().map((key) => toStandalone(data, key))

// helper/non-exported items
/**
* Since our data is complete as is, this just makes a copy for safety's sake.
*/
const toStandalone = (data, name) => Object.assign({ id: name }, data.vendors[name])

export { get, list }
