import { TSV } from 'tsv'
import { Roles } from './roles'

describe(`Roles`, () => {
	let testRoles
	beforeAll(() => {
		testRoles = new Roles(`./js/roles/test_data.tsv`)
	})

	test('parses test file', () => expect(testRoles).toBeTruthy())
	test('ignore blank lines', () => expect(testRoles.length).toBe(1))
})
