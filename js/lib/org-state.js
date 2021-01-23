import * as fjson from '@liquid-labs/federated-json'

import { loadBashSettings } from './bash-env'

const loadOrgState = (dataPath) => {
  const liqSettingsPath = `${process.env.HOME}/.liq/settings.sh`
  loadBashSettings(liqSettingsPath, 'LIQ_PLAYGROUND')

  // first, we handle the original bash-centric approach, centered on individual settings
  const orgSettingsPath = `${dataPath}/orgs/settings.sh`
  // TODO: the 'ORG_ID' is expected to be set from the old style settings.sh; we should take this in the constructor
  loadBashSettings(orgSettingsPath, 'ORG_ID')
  // the 'settings.sh' values are now availale on process.env

  // and here's the prototype new approach; the read function handles the 'exists' check
  return fjson.read(`${dataPath}/orgs/${process.env.ORG_ID}.json`)
}

export { loadOrgState }
