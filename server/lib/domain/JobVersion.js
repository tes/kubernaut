export default class JobVersion {

  constructor({ id, job, version, createdOn, createdBy, yaml, lastApplied, isLatestApplied }) {
    this.id = id;
    this.job = job;
    this.version = version;
    this.createdOn = createdOn;
    this.createdBy = createdBy;
    this.yaml = yaml;
    this.lastApplied = lastApplied;
    this.isLatestApplied = isLatestApplied;
  }

}
