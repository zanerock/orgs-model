import { Role } from './Role'
import { TsvExt } from '../lib'

const RolesTsv = class extends TsvExt {
	static headers = ['Name', 'Application', 'Super-role', 'Description', 'Notes']
	static keys = ['name', 'application', 'superRole', 'description', 'notes']

	constructor(fileName) {
		super(RolesTsv.headers, RolesTsv.keys, fileName)
	}

	notUnique(data, item) {
		let i
		return -1 !== (i = data.findIndex((line) => line[0].toLowerCase() === item.name.toLowerCase()))
			&& `Role with name '${item.name}' already exists at entry ${i}.`
	}

	matchKey = (line, key) => line[0] === key

	/**
	* Turns the 'row' data into minimal Row objects.
	*/
	hydrate() {
		return this.getItems().reduce(
			(roles, item) => {
				roles[item.name] = new Role(item)
				return roles
			}, {})
	}
}

export { RolesTsv }
