const Role = class {
  constructor(rec) {
    Object.assign(this, rec)
  }

  getName() { return this.name }

  isTitular() { return !!this.titular }

  isQualifiable() { return !!this.qualifiable }
}

export { Role }
