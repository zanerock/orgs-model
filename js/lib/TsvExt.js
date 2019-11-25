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
  #headers
  #fileName
  #keys
  #data
  #cursor

  constructor(headers, keys, fileName) {
    this.headers = headers
    this.fileName = fileName

    const contents = fs.readFileSync(fileName, 'utf8')
    // allow blank lines (which are ignored)
    const lines = contents.split("\n")
    lines.shift() // remove headers line
    const filteredLines = lines.filter((line) => !line.match(/^\s*$/))
    TSV.header = false
    this.keys = keys
    this.data = TSV.parse(filteredLines.join("\n"))
  }

  get length() { return this.data.length }

  reset() { this.cursor = -1 }

  next() {
    this.cursor += 1
    if (this.cursor > this.length) return null
    else return item(this.keys, this.data[this.cursor], this.cursor)
  }

  add(item) {
    const line = []
    this.keys.forEach((key) => {
      const field = item[key]
      if (field === undefined) throw new Error(`Item does not define key '${key}'.`)
      line.push(field)
    })
    let failDesc;
    if (this.notUnique && (failDesc = this.notUnique(this.data.slice(), item))) throw new Error(failDesc)
    this.data.push(line)
  }

  remove(key) {
    const index = this.data.findIndex((line) => this.matchKey(line, key))
    if (index >= 0) return this.data.splice(index, 1)
    else return null
  }

  write() {
    fs.writeFileSync(this.fileName,
                     `${this.headers.join("\t")}\n${this.data.map((line) => line.join("\t")).join("\n")}\n`)
  }
}

export { TsvExt }
