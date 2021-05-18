import * as fjson from '@liquid-labs/federated-json'

/**
* Basic methods for accessing the audit record data. Note that functionality is split up like this to make these
* functions easier to unit test.
*/

/**
* Retrieves a single audit record entry by name <audit name>/<target>.
*/
const get = (data, id) => {
  const [auditName, targetId] = splitId(id)
  return data?.auditRecords?.[auditName]?.[targetId] && toStandalone(data, auditName, targetId)
}

const list = (data, { domain, 'audit name': auditName }) => {
  if (data.auditRecords === undefined) {
    return []
  }

  const domainKeys = domain === undefined
    ? Object.keys(data.auditRecords || {})
    : [domain]

  return domainKeys.reduce((acc, domainName) => {
    const domainRecs = data.auditRecords[domainName] || {}
    const auditNames = auditName === undefined
      ? Object.keys(domainRecs)
      : [auditName]
    for (const auditName of auditNames) {
      const auditRecs = domainRecs[auditName] || {}
      for (const targetId of Object.keys(auditRecs)) {
        acc.push(toStandalone(data, auditName, targetId))
      }
    }
    return acc
  },
  [])
    .sort((a, b) => a.id.localeCompare(b.id))
}

const persist = (data, { domain, domains }) => {
  if (!domains && domain) {
    domains = [domain]
  }
  if (domains && domains.length > 0) {
    for (domain of domains) {
      fjson.write({ data, saveFrom : `.auditRecords.${domain}` })
    }
  }
  else {
    fjson.write({ data, saveFrom : '.auditRecords' })
  }
}

const update = (data, auditRecord) => {
  const { id } = auditRecord
  const [auditName, targetId] = splitId(id)
  const [domain] = auditName.split('-')

  if (!data.auditRecords[domain]) {
    data.auditRecords[domain] = {}
  }
  if (!data.auditRecords[domain][auditName]) {
    data.auditRecords[domain][auditName] = {}
  }

  const auditRecCopy = Object.assign({}, auditRecord)
  delete auditRecCopy.id
  delete auditRecCopy.weight
  delete auditRecCopy.auditName
  data.auditRecords[domain][auditName][targetId] = auditRecCopy
}

// helper/non-exported items
const splitId = (id) => {
  if (id === undefined) {
    throw new Error('Must provide id in call to get audit records.')
  }
  const [auditName, targetId] = id.split(/\/(.+)/)
  if (auditName === undefined || targetId === undefined) {
    throw new Error(`Malformed audit record ID '${id}'. Should have form '<audit name>/<target ID>'.`)
  }
  return [auditName, targetId]
}

/**
* Since our data is complete as is, this just makes a copy for safety's sake.
*/
const toStandalone = (data, auditName, targetId) => {
  const [domain] = auditName.split(/-(.+)/)
  return Object.assign({
    id : `${auditName}/${targetId}`,
    domain
  },
  data.auditRecords[domain][auditName][targetId])
}

export { get, list, persist, update }
