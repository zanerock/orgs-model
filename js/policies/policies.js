import { Roles } from '../roles'
import * as fs from 'fs'

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
    this.roles = new Roles(rolesFile)
    return this.roles
  }

  findFile(baseName) {
    const re = new RegExp(`/${baseName}$`)
    const results = this.sourceFiles.filter((f) => f.match(re))
    if (results.length > 1) throw new Error(`Found multiple files matching '${baseName}'`)
    else if (results.length === 0) return null
    else return results[0]
  }

  addTerm(term, definition) {
    this.terms.push([term, definition])
  }

  setDocumentDir(dir) {
    this.docDir = dir
  }

  generateDocuments() {
    if (this.docDir === undefined) throw new Error('No document directory defined.')
    if (!fs.existsSync(this.docDir)) throw new Error(`Target document dir '${this.docDir}' does not exist.`)

    const roles = this.getRoles()
    roles.reset()
    let i; while ((i = roles.next())) {
      this.addTerm(i['name'], i['description'])
    }

    let glossaryContent = "# Glossary\n\n<dl>"
    this.terms.sort((a, b) => a[0].localeCompare(b[0]))
    this.terms.forEach(([term, def]) => glossaryContent += `  <dt>${term}</dt>\n  <dd>${def}</dd>\n\n`)
    glossaryContent += "</dl>\n"
    fs.writeFileSync(`${this.docDir}/Glossary.md`, glossaryContent)
  }
}

export { Policies }
