export default class Job {

  constructor({ id, createdOn, createdBy, name, namespace, registry, description }) {
    this.id = id;
    this.name = name;
    this.createdOn = createdOn;
    this.createdBy = createdBy;
    this.namespace = namespace;
    this.registry = registry;
    this.description = description;
  }

}
