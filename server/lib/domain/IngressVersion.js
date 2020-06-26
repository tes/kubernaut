export default class IngressEntry {

  constructor({ id, comment, service, entries = [], createdBy, createdOn }) {
    this.id = id;
    this.comment = comment;
    this.service = service;
    this.entries = entries;
    this.createdBy = createdBy;
    this.createdOn = createdOn;
  }

}
