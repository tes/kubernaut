export default class Cluster {

  constructor({ id, name, context, createdOn, createdBy, }) {
    this.id = id;
    this.name = name;
    this.context = context;
    this.createdOn = createdOn;
    this.createdBy = createdBy;
  }
}
