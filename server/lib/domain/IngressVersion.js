export default class IngressVersion {

  constructor({ id, comment, service, createdBy, createdOn, entries }) {
    this.id = id;
    this.comment = comment;
    this.service = service;
    this.entries = entries;
    this.createdBy = createdBy;
    this.createdOn = createdOn;
  }

}
