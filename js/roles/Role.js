const Role = class {
  constructor(rec) {
    Object.assign(this, rec)
  }

  getName() { return this.name }

  isTitular() { return this.titular ? true : false }

  isQualifiable() { return this.qualifiable ? true : false }
}

export { Role }
