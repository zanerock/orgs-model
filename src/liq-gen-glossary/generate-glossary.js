import * as fs from 'fs'

import * as fjson from '@liquid-labs/federated-json'

/**
* Expects JSON files of the form: { <term>: "<definition>", ... }
*/
const generateGlossary = ({ definitionFiles, continueOnError=false }) => {
  // Will have the sturcture: { <term>: { definition: "...", sourcePath: "..." }, ... }
  const allTerms = {}

  // build up 'allTerms' while verifying terms unique
  for (const sourcePath of definitionFiles) {
    const sourceTerms = fjson.read(sourcePath)

    for (const term of Object.keys(sourceTerms)) {
      // check if mulitple definitions
      if (allTerms[term] !== undefined) {
        const msg = `'${term}' defined in '${sourcePath}' also defined in '${allTerms[term].sourcePath}'; keeping original definition.`
        if (continueOnError === true) {
          console.error(msg)
        }
        else {
          throw new Error(msg)
        }
      } // end multiple definition test
      else { // the term is unique
        allTerms[term] = sourceTerms[term]
      }
    } // for of source terms
  } // for in definitionFiles

  return allTerms
}

export { generateGlossary }
