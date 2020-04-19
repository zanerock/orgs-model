import { StaffTsv } from '../StaffTsv'

describe(`StaffTsv`, () => {
	let testStaffTsv
	beforeAll(() => {
		testStaffTsv = new StaffTsv(`./js/staff/test/staff.tsv`)
	})

	test('detects duplicate emails on init', () =>
		expect(() => new StaffTsv(`./js/staff/test/dupe_email_staff.tsv`).init()).
			toThrow(/email.*ceo@foo.com/))

	test('filters header+blank lines', () => expect(testStaffTsv.length).toBe(4))

	test(`fields`, () => {
		const rows = testStaffTsv.getItems()
		const ceo = rows[0]
		expect(ceo['email']).toBe('ceo@foo.com')
		expect(ceo['primaryRoles']).toEqual(['CEO/', 'CTO/ceo@foo.com/acting'])
		expect(ceo['secondaryRoles']).toEqual([])
		const dev = rows[1]
		expect(dev['primaryRoles']).toEqual(['Developer/' + ceo['email']])
	})
})
