import { TsvExt } from '../lib'

const Roles = class extends TsvExt {
	static keys = ['name', 'application', 'superRole', 'description', 'notes']

	constructor(fileName) {
		super(Roles.keys, fileName)
	}
}

export { Roles }
