import { StaffTsv } from '../StaffTsv'

describe(`StaffTsv`, () => {
	let testStaffTsv
	beforeAll(() => {
		testStaffTsv = new StaffTsv(`./js/staff/test/staff.tsv`)
	})

	test('test file', () => expect(testStaffTsv).toBeTruthy())

	test('blank lines', () => expect(testStaffTsv.length).toBe(3))

	test(`fields`, () => {
		const rows = testStaffTsv.getRows()
		const ceo = rows[0]
		expect(ceo['email']).toBe('ceo@foo.com')
		expect(ceo['primaryRoles']).toEqual(['CEO/', 'CTO/ceo@foo.com'])
		expect(ceo['secondaryRoles']).toEqual([])
		const dev = rows[1]
		expect(dev['primaryRoles']).toEqual(['Developer/' + ceo['email']])
	})
})
