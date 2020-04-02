import { AttachedRole } from './AttachedRole'

const Role = class {
  constructor(item) {
    this.item = item
  }

  getName() { return this.item.name }

  isQualifiable() {
    const application = this.item.application
    return Boolean(application && application.match(/(^|;)\s*qualifiable\s*(;|$)/))
  }

  attachTo(staff, parameters) {
    return new AttachedRole(this, staff, parameters)
  }
}


export { Role }
