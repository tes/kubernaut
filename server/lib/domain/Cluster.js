export default class Cluster {

  constructor({ id, name, context, config, createdOn, createdBy, }) {
    this.id = id;
    this.name = name;
    this.context = context;
    this.config = config;
    this.createdOn = createdOn;
    this.createdBy = createdBy;
  }
}
