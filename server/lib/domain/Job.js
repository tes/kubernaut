export default class Job {

  constructor({ id, createdOn, createdBy, name, namespace }) {
    this.id = id;
    this.name = name;
    this.createdOn = createdOn;
    this.createdBy = createdBy;
    this.namespace = namespace;
  }

}
