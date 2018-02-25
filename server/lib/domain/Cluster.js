export default class Cluster {

  constructor({ id, name, config, createdOn, createdBy, }) {
    this.id = id;
    this.name = name;
    this.config = config;
    this.createdOn = createdOn;
    this.createdBy = createdBy;
  }
}
