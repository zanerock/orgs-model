import * as fs from 'fs'
import TSV from 'tsv'

const Roles = class {
	#data

	constructor(file) {
		const contents = fs.readFileSync(file, 'utf8')
		const lines = contents.split("\n")
		const filteredLines = lines.filter((line) => !line.match(/^\s*$/))

		this.data = TSV.parse(filteredLines.join("\n"))
	}

	get length() { return this.data.length }
}

export { Roles }
