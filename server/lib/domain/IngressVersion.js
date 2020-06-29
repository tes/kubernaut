export default class IngressVersion {

  constructor({ id, comment, service, createdBy, createdOn }) {
    this.id = id;
    this.comment = comment;
    this.service = service;
    this.createdBy = createdBy;
    this.createdOn = createdOn;
  }

}
