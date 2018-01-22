export default class Namespace {

  constructor({ id, name, cluster, createdOn, createdBy, }) {
    this.id = id;
    this.name = name;
    this.cluster = cluster;
    this.createdOn = createdOn;
    this.createdBy = createdBy;
  }
}
