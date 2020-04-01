import { Staff } from './Staff'

import { TsvExt } from '../lib'

const StaffTsv = class extends TsvExt {
  static headers = [ 'Email', 'Family Name', 'Given Name', 'Start Date', 'Primary Roles', 'Secondary Roles' ]
  static keys = [ 'email', 'familyName', 'givenName', 'startDate', 'primaryRoles', 'secondaryRoles' ]
  static multis = { 'primaryRoles' : true, 'secondaryRoles' : true, 'managers' : true }

	constructor(fileName) {
    super(StaffTsv.headers, StaffTsv.keys, fileName, StaffTsv.multis)
	}

  matchKey = (line, key) => line[0] === key

  init() {
    return this.getItems().reduce(
			(staff, item) => {
        if (staff[item.email] !== undefined)
          throw new Error(`member with email '${item.email}' already exists at entry ${item._pos + 1}.`)
				staff[item.email] = new Staff(item)
				return staff
			}, {})
  }
}

export { StaffTsv }
