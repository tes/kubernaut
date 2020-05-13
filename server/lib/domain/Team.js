export default class Team {
  constructor({ id, name, createdOn, createdBy, attributes, accountsCount, servicesCount }) {
    this.id = id;
    this.name = name;
    this.createdOn = createdOn;
    this.createdBy = createdBy;
    this.attributes = attributes;
    this.accountsCount = accountsCount;
    this.servicesCount = servicesCount;
  }
}
