import * as fs from 'fs'
import TSV from 'tsv'

/**
 * Converts array-string data to an intermediate object. Handles the special '-' <=> null and muti-part field
 * conversions to arrays.
 */
const item = function(keys, multis, fields, pos) {
  if (keys.length !== fields.length)
    throw new Error(`Found ${keys.length} keys but ${fields.length} fields at item ${pos} (${fields[0]}).`)

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
    this.data = filteredLines.length > 0 ? TSV.parse(filteredLines.join("\n")) : []
  }

  get length() { return this.data.length }

  getItems() { return this.data.map((r, i) => item(this.keys, this.multis, r, i)) }

  write() {
    fs.writeFileSync(this.fileName,
                     `${this.headers.join("\t")}\n` +
                     `${this.data.map((line) =>
                          line.map(v => v === ''
                            ? '-'
                            : v).join("\t")).join("\n")}\n`)
  }

  // Generic find; assumes the first column is the key.
  find(key) {
		return this.data.find((line) => line[0] === key)
	}
}

export { TsvExt }
