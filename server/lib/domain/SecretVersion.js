export default class SecretVersion {

  constructor({ id, comment, createdOn, createdBy, service, namespace }) {
    this.id = id;
    this.comment = comment;
    this.createdOn = createdOn;
    this.createdBy = createdBy;
    this.service = service;
    this.namespace = namespace;
  }
}
