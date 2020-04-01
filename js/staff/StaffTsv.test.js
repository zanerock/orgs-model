import { StaffTsv } from './StaffTsv'

describe(`StaffTsv`, () => {
	let testStaffTsv
	beforeAll(() => {
		testStaffTsv = new StaffTsv(`./js/staff/test_data.tsv`)
	})

	test('test file', () => expect(testStaffTsv).toBeTruthy())
	test('blank lines', () => expect(testStaffTsv.length).toBe(2))
	test(`fields`, () => {
		testStaffTsv.reset()
		const ceo = testStaffTsv.next()
		expect(ceo['email']).toBe('ceo@bar.com')
		expect(ceo['primaryRoles']).toEqual(['CEO/', 'CTO/'])
		expect(ceo['secondaryRoles']).toEqual([])
		const vp = testStaffTsv.next()
		expect(vp['primaryRoles']).toEqual(['VP/' + ceo['email']])
	})
})
