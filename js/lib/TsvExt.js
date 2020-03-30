import * as fs from 'fs'
import TSV from 'tsv'

/**
 * Converts array-string data to an actual object
 */
const item = function(keys, multis, fields, pos) {
  if (keys.length !== fields.length) throw new Error(`Found ${keys.length} keys but ${fields.length} fields.`)

  const item = { _pos: pos }
  for (let i = 0; i < fields.length; i += 1) {
    item[keys[i]] = (multis[keys[i]]
      ? (fields[i] === '' || fields[i] === '-' ? [] : fields[i].split(/\s*,\s*/))
      : (fields[i] === '' || fields[i] === '-' ? null : fields[i]))
  }

  return item
}

const TsvExt = class {
  #headers
  #fileName
  #keys
  #data
  #cursor

  constructor(headers, keys, fileName, multis) {
    this.headers = headers
    this.fileName = fileName

    const contents = fs.readFileSync(fileName, 'utf8')
    const lines = contents.split("\n")
    lines.shift() // remove headers line
    // allow blank lines (which are ignored)
    const filteredLines = lines.filter((line) => !line.match(/^\s*$/))

    TSV.header = false
    this.keys = keys
    this.multis = multis || {}
    this.data = TSV.parse(filteredLines.join("\n"))
  }

  get length() { return this.data.length }

  reset() { this.cursor = -1 }

  next() {
    this.cursor += 1
    if (this.cursor >= this.length) return null
    else return item(this.keys, this.multis, this.data[this.cursor], this.cursor)
  }

  add(item) {
    const line = []
    this.keys.forEach((key) => {
      const value = item[key]
      if (value === undefined) throw new Error(`Item does not define value for key '${key}'.`)
      line.push(this.multis[key]
        ? (value.length === 0 ? '-' : value.join(","))
        : (value === null ? '-' : value))
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
                     `${this.headers.join("\t")}\n` +
                     `${this.data.map((line) =>
                          line.map(v => v === ''
                            ? '-'
                            : v).join("\t")).join("\n")}\n`)
  }
}

export { TsvExt }
