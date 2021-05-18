import * as fjson from '@liquid-labs/federated-json'

/**
* Basic methods for accessing the audit record data. Note that functionality is split up like this to make these
* functions easier to unit test.
*/

/**
* Retrieves a single audit record entry by name <audit name>/<target>.
*/
const get = (data, id) => {
  const [ auditName, targetId ] = splitId(id)
  data?.auditRecords?.[auditName]?.[targetId] && toStandalone(data, auditName, targetId)
}

const list = (data, { domain }) => {
  if (data.auditRecords === undefined) {
    return []
  }

  const domainKeys = domain === undefined
    ? Object.keys(data.auditRecords || {})
    : [ domain ]

  return domainKeys.reduce((acc, domainName) => {
    const domainRecs = data.auditRecords[domainName]
    for (const auditName of Object.keys(domainRecs)) {
      const auditRecs = domainRecs[auditName]
      for (const targetId of Object.keys(auditRecs)) {
        acc.push(toStandalone(data, auditName, targetId))
      }
    }
    return acc
  },
  [])
  .sort((a,b) => a.id.localCompare(b.id))
}

const save = (data, subPath) => fjson.write({ data, saveFrom: `.auditRecords${subPath}` })

// helper/non-exported items
const splitId = (id) => {
  id === undefined && throw new Error('Must provide id in call to get audit records.')
  const [ auditName, targetId ] = id.split('/')
  (auditName === undefined || targetId === undefined)
    && throw new Error(`Malformed audit record ID '${id}'. Should have form '<audit name>/<target ID>'.`)
  return [ auditName, targetId ]
}

const domainRe = /^([^-]?-.+)/

/**
* Since our data is complete as is, this just makes a copy for safety's sake.
*/
const toStandalone = (data, auditName, targetId) =>
  Object.assign({
      id: `${auditName}/${targetId}`,
      domain: auditName.replace(domainRe, '${1}')
    },
    data.auditRecords[auditName][targetId])

export { get, list }
