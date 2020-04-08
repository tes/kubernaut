export default class JobVersion {

  constructor({ id, version, createdOn, createdBy, yaml }) {
    this.id = id;
    this.version = version;
    this.createdOn = createdOn;
    this.createdBy = createdBy;
    this.yaml = yaml;
  }

}
