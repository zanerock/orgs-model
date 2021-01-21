import dotenv from 'dotenv'
import * as fs from 'fs'

const loadBashSettings = (settingsPath, ...requiredParams) => {
  if (!fs.existsSync(settingsPath)) {
    throw new Error(`Did not find expected settings file: '${settingsPath}'`)
  } // else continue
  const envResult = dotenv.config({ path: settingsPath })
  if (envResult.error) {
    throw envResult.error
  }

  for (const reqParam of requiredParams) {
    if (process.env[reqParam] === undefined) {
      throw new Error(`Did not find expected '${reqParam}' value in settings file: ${settingsPath}`)
    }
  }
}

export { loadBashSettings }
