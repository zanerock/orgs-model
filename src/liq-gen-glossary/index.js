import { generateGlossary } from './generate-glossary'

// TODO: the use of an 'index' file is a little misleading in this case. We want to build a tool, not a 'bundle'. We would like to update the catalyst-scripts (which need to be reworked) to be a bit more flexible.

const dashCase = (term) => {
  return term.toLowerCase().replace(/[^a-z0-9]/ig, '-')
}

const definitionFiles = [...process.argv.slice(2)]

const allTerms = generateGlossary({ definitionFiles })

// Note: 'console.log(...)' adds it's own newline, so the '\n' in the following creates a blank line.
console.log('# Glossary\n')
console.log('<dl>\n')
for (const term of Object.keys(allTerms) || []) {
  console.log(`<dt id="${dashCase(term)}">${term}</dt>`)
  console.log(`<dd>${allTerms[term]}</dd>\n`)
}
console.log('</dl>')
