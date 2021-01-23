/* globals test expect */
/**
* This is simply a hack acound the (I say bug) that eslint freaks out if it can't find any JavaScript files in a
* subdirectory of the source dir.
*/

test('Hack test to satisfy eslint bug.', () => expect(true).toBe(true))
