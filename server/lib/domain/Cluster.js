export default class Cluster {

  constructor({ id, name, config, createdOn, createdBy, color, priority }) {
    this.id = id;
    this.name = name;
    this.config = config;
    this.createdOn = createdOn;
    this.createdBy = createdBy;
    this.color = color;
    this.priority = priority;
  }
}
