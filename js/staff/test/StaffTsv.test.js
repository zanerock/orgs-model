import { StaffTsv } from '../StaffTsv'

describe(`StaffTsv`, () => {
	let testStaffTsv
	beforeAll(() => {
		testStaffTsv = new StaffTsv(`./js/staff/test/staff.tsv`)
	})

	test('test file', () => expect(testStaffTsv).toBeTruthy())
	test('blank lines', () => expect(testStaffTsv.length).toBe(3))
	test(`fields`, () => {
		testStaffTsv.reset()
		const ceo = testStaffTsv.next()
		expect(ceo['email']).toBe('ceo@foo.com')
		expect(ceo['primaryRoles']).toEqual(['CEO/', 'CTO/ceo@foo.com'])
		expect(ceo['secondaryRoles']).toEqual([])
		const dev = testStaffTsv.next()
		expect(dev['primaryRoles']).toEqual(['Developer/' + ceo['email']])
	})
})
