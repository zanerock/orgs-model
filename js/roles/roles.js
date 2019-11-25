import { TsvExt } from '../lib'

const Roles = class extends TsvExt {
	static headers = ['Name', 'Application', 'Super-role', 'Description', 'Notes']
	static keys = ['name', 'application', 'superRole', 'description', 'notes']

	constructor(fileName) {
		super(Roles.headers, Roles.keys, fileName)
	}

	notUnique(data, item) {
		let i
		return -1 !== (i = data.findIndex((line) => line[0].toLowerCase() === item.name.toLowerCase()))
			&& `Role with name '${item.name}' already exists at entry ${i}.`
	}

	matchKey = (line, key) => line[0] === key
}

export { Roles }
