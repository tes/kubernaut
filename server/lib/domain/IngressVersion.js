export default class IngressVersion {

  constructor({ id, comment, service, createdBy, createdOn, entries, yaml }) {
    this.id = id;
    this.comment = comment;
    this.service = service;
    this.entries = entries;
    this.createdBy = createdBy;
    this.createdOn = createdOn;
    this.yaml = yaml;
  }

  setYaml(yaml) {
    this.yaml = yaml;
  }
}
