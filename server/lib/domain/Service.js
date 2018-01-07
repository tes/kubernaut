export default class Service {

  constructor({ id, name, namespace, createdOn, createdBy, }) {
    this.id = id;
    this.name = name;
    this.namespace = namespace;
    this.createdOn = createdOn;
    this.createdBy = createdBy;
  }
}
