import { Staff } from './Staff'

describe(`Staff`, () => {
	let testStaff
	beforeAll(() => {
		testStaff = new Staff(`./js/staff/test_data.tsv`)
	})

	test('test file', () => expect(testStaff).toBeTruthy())
	test('blank lines', () => expect(testStaff.length).toBe(1))
	test(`fields`, () => {
		testStaff.reset()
		const staff = testStaff.next()
		expect(staff['email']).toBe('foo@bar.com')
		expect(staff['primaryRoles']).toEqual(['CEO', 'CTO'])
		expect(staff['secondaryRoles']).toEqual([])
	})
})
