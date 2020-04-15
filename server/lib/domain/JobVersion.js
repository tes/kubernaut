export default class JobVersion {

  constructor({ id, job, version, createdOn, createdBy, yaml }) {
    this.id = id;
    this.job = job;
    this.version = version;
    this.createdOn = createdOn;
    this.createdBy = createdBy;
    this.yaml = yaml;
  }

}
