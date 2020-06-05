import { RolesTsv } from '../roles'
import * as fs from 'fs'
import { Glossary } from './lib/Glossary'

const Policies = class {
  #docDir
  #roles
  #rolesFile
  #terms
	sourceFiles

	constructor() {
    this.sourceFiles = []
    this.rolesFile = 'roles.tsv'
    this.terms = []
  }

  addSourceFile(fileName) {
    this.sourceFiles.push(fileName)
  }

  setRolesFile(name) {
    this.rolesFile = name
  }

  getRoles() {
    if (this.roles !== undefined) return this.roles

    // TODO: allom multiple role files to be merged
    const rolesFile = this.findFile(this.rolesFile)
    this.roles = new RolesTsv(rolesFile)
    return this.roles
  }

  findFile(baseName) {
    const re = new RegExp(`/${baseName}$`)
    const results = this.sourceFiles.filter((f) => f.match(re))
    if (results.length > 1) throw new Error(`Found multiple files matching '${baseName}' (${results})`)
    else if (results.length === 0) return null
    else return results[0]
  }

  setDocumentDir(dir) {
    this.docDir = dir
  }

  generateDocuments() {
    if (this.docDir === undefined) throw new Error('No document directory defined.')
    if (!fs.existsSync(this.docDir)) throw new Error(`Target document dir '${this.docDir}' does not exist.`)

    const roles = this.getRoles()

    const glossary = new Glossary()
    if (roles) glossary.addTermsFromIterator(roles)
    // TODO: else warn

    fs.writeFileSync(`${this.docDir}/Glossary.md`, glossary.generateContent())
  }
}

export { Policies }
