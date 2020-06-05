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
		expect(ceo['employmentStatus']).toEqual('employee')
		const dev = rows[1]
		expect(dev['primaryRoles']).toEqual(['Developer/' + ceo['email']])
	})

	test('writes as expected', () => {
		const out = testStaffTsv.writeString()
		// console.log(out)
		const expected = `Email	Family Name	Given Name	Start Date	Primary Roles	Secondary Roles	Employment Status
ceo@foo.com	Foo	CEO	2019-06-17	CEO/, CTO/ceo@foo.com/acting	-	employee
dev@foo.com	Bar	Dev	2019-06-18	Developer/ceo@foo.com	In House Counsel	employee
uidev@foo.com	Bar	UI	2019-08-20	Developer/dev@foo.com/qual:UI	-	contractor
test@foo.com	Baz	Test	2019-07-10	Tester/ceo@foo.com	-	contractor
`
		expect(out).toEqual(expected)
	})
})
