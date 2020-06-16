export default class Namespace {

  constructor({ id, name, cluster, createdOn, createdBy, color, attributes }) {
    this.id = id;
    this.name = name;
    this.cluster = cluster;
    this.createdOn = createdOn;
    this.createdBy = createdBy;
    this.color = color;
    this.attributes = attributes;
  }
}
