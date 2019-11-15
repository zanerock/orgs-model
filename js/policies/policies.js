const Policies = class {
	sourceFiles

	constructor() {
    this.sourceFiles = []
  }

  addSourceFile(fileName) {
    this.sourceFiles.push(fileName)
  }
}

export { Policies }
