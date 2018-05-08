export default class Service {

  constructor({ id, name, registry, createdOn, createdBy }) {
    this.id = id;
    this.name = name;
    this.registry = registry;
    this.createdOn = createdOn;
    this.createdBy = createdBy;
  }
}
