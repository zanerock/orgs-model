import { Staff } from './Staff'

describe(`Staff`, () => {
	let testStaff
	beforeAll(() => {
		testStaff = new Staff(`./js/staff/test_data.tsv`)
	})

	test('test file', () => expect(testStaff).toBeTruthy())
	test('blank lines', () => expect(testStaff.length).toBe(2))
	test(`fields`, () => {
		testStaff.reset()
		const ceo = testStaff.next()
		expect(ceo['email']).toBe('ceo@bar.com')
		expect(ceo['primaryRoles']).toEqual(['CEO/', 'CTO/'])
		expect(ceo['secondaryRoles']).toEqual([])
		const vp = testStaff.next()
		expect(vp['primaryRoles']).toEqual(['VP/' + ceo['email']])
	})
})
