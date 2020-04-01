import { OrgStructure } from '../OrgStructure'

describe(`OrgStructure`, () => {
  let orgStructure
  beforeAll(() => {
    orgStructure = new OrgStructure(`${__dirname}/../../../js/orgs/test/org_structure.json`)
  })

	test(`successfull loads test file`, () => {
    expect(orgStructure).not.toBe(undefined)
    expect(orgStructure.getRoots().length).toEqual(1)
    expect(orgStructure.getNodes().length).toEqual(4)
  })

  test(`can retrieve a node by name`, () => {
    let node = orgStructure.getNodeByRoleName('Developer')
    expect(node).not.toBe(undefined)
    expect(node.getName()).toEqual('Developer')
    expect(node.getChildren()).toEqual([])
  })

  test(`detects duplicate roles in structure`, () => {
    expect(() => new OrgStructure(`${__dirname}/../../../js/orgs/test/dupe_org_structure.json`)).
      toThrow(/non-unique.*CEO/)
  })

  test(`detects bad manager-role reference`, () => {
    expect(() => new OrgStructure(`${__dirname}/../../../js/orgs/test/bad_manager_org_structure.json`)).
      toThrow(/Invalid.*Bad Manager/)
  })

  describe(`nodes`, () => {
    test.each`
    name | count
    ${'CEO'} | ${3}
    ${'CTO'} | ${2}
    ${'Developer'} | ${0}
    `(`expect $count descendents for node '$name'`, ({name, count}) => {
      expect(orgStructure.getNodeByRoleName(name).getDescendents()).toHaveLength(count)
    })

    test.each`
    name | count
    ${'CEO'} | ${4}
    ${'CTO'} | ${3}
    ${'Developer'} | ${1}
    `(`expect $count tree nodes for node '$name'`, ({name, count}) => {
      expect(orgStructure.getNodeByRoleName(name).getTreeNodes()).toHaveLength(count)
    })

    test(`'CEO' has null parent`, () => {
      expect(orgStructure.getNodeByRoleName('CEO').getParent()).toBe(null)
    })

    test.each`
    name | parentName
    ${'CTO'} | ${'CEO'}
    ${'Developer'} | ${'CTO'}
    `(`'$name' has parent '$parentName'`, ({name, parentName}) => {
      expect(orgStructure.getNodeByRoleName(name).getParent().getName()).toEqual(parentName)
    })
  })
})
