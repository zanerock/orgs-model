import { Staff } from './Staff'

import { TsvExt } from '../lib'

const StaffTsv = class extends TsvExt {
  static headers = [ 'Email', 'Family Name', 'Given Name', 'Start Date', 'Primary Roles', 'Secondary Roles' ]
  static keys = [ 'email', 'familyName', 'givenName', 'startDate', 'primaryRoles', 'secondaryRoles' ]
  static multis = { 'primaryRoles' : true, 'secondaryRoles' : true, 'managers' : true }

	constructor(fileName) {
    super(StaffTsv.headers, StaffTsv.keys, fileName, StaffTsv.multis)
	}

  notUnique(data, item) {
    let i
    return -1 !== (i = data.findIndex((line) =>
                                      line[0].toLowerCase() === item.email.toLowerCase()))
           && `member with email '${item.email}' already exists at entry ${i + 1}.`
  }

  matchKey = (line, key) => line[0] === key

  hydrate() {
    return this.getRows().reduce(
			(staff, row) => {
				staff[row.email] = new Staff(row) //  TODO: clone item to protect data
				return staff
			}, {})
  }
}

export { StaffTsv }
