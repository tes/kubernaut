export default class Deployment {

  constructor({ id, release, namespace, manifest, applyExitCode, rolloutStatusExitCode, log, createdOn, createdBy, deletedOn, deletedBy, }) {
    this.id = id;
    this.namespace = namespace;
    this.release = release;
    this.manifest = manifest;
    this.applyExitCode = applyExitCode;
    this.rolloutStatusExitCode = rolloutStatusExitCode;
    this.log = log;
    this.createdOn = createdOn;
    this.createdBy = createdBy;
    this.deletedOn = deletedOn;
    this.deletedBy = deletedBy;
  }
}
