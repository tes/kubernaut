export default class Team {
  constructor({ id, name, createdOn, createdBy, attributes }) {
    this.id = id;
    this.name = name;
    this.createdOn = createdOn;
    this.createdBy = createdBy;
    this.attributes = attributes;
  }
}
