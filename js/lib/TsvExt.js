import * as fs from 'fs'
import TSV from 'tsv'

const item = function(keys, fields, pos) {
  if (keys.length !== fields.length) throw new Error(`Found ${keys.length} keys but ${fields.length} fields.`)

  const item = { _pos: pos }
  for (let i = 0; i < fields.length; i += 1) {
    item[keys[i]] = fields[i]
  }

  return item
}

const TsvExt = class {
  #fileName
  #header
  #keys
  #data
  #cursor

  constructor(keys, fileName) {
    this.fileName = fileName

    const contents = fs.readFileSync(fileName, 'utf8')
    // allow blank lines (which are ignored)
    const lines = contents.split("\n")
    this.header = lines.shift()
    const filteredLines = lines.filter((line) => !line.match(/^\s*$/))
    TSV.header = false
    this.keys = keys
    this.data = TSV.parse(filteredLines.join("\n"))
  }

  reset() { this.cursor = -1 }

  next() {
    this.cursor += 1
    if (this.cursor > this.length) return null
    else return item(this.keys, this.data[this.cursor], this.cursor)
  }

  get length() { return this.data.length }
}

export { TsvExt }
