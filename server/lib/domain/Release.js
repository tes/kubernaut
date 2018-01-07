export default class Release {

  constructor({ id, service, version, template, attributes, createdOn, createdBy, deletedOn, deletedBy, }) {
    this.id = id;
    this.service = service;
    this.version = version;
    this.template = template;
    this.attributes = attributes;
    this.createdOn = createdOn;
    this.createdBy = createdBy;
    this.deletedOn = deletedOn;
    this.deletedBy = deletedBy;
  }
}
