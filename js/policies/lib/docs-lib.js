class Glossary {
  constructor() {
    this.terms = []
  }

  addTerm(term, definition) {
    this.terms.push([term, definition])
  }

  addTermsFromIterator({it, termKey='name', descKey='description'}) {
    it.reset()
    let i; while ((i = it.next())) {
      this.addTerm(i[termKey], i[descKey])
    }
  }

  generateContent() {
    let content = "# Glossary\n\n<dl>"
    this.terms.sort((a, b) => a[0].localeCompare(b[0]))
    this.terms.forEach(([term, def]) => content += `  <dt>${term}</dt>\n  <dd>${def}</dd>\n\n`)
    content += "</dl>\n"

    return content
  }
}
