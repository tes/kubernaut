export default class Deployment {

  constructor({ id, release, namespace, manifest, attributes, applyExitCode, rolloutStatusExitCode, log, createdOn, createdBy, deletedOn, deletedBy }) {
    this.id = id;
    this.namespace = namespace;
    this.release = release;
    this.manifest = manifest;
    this.attributes = attributes;
    this.applyExitCode = applyExitCode;
    this.rolloutStatusExitCode = rolloutStatusExitCode;
    this.status = getStatus(applyExitCode, rolloutStatusExitCode);
    this.log = log;
    this.createdOn = createdOn;
    this.createdBy = createdBy;
    this.deletedOn = deletedOn;
    this.deletedBy = deletedBy;
  }
}

function getStatus(applyExitCode, rolloutStatusExitCode) {
  if (applyExitCode === 0 && rolloutStatusExitCode === 0) return 'successful';
  if (applyExitCode > 0 || rolloutStatusExitCode > 0) return 'failed';
  if (applyExitCode === 0) return 'applied';
  return 'pending';
}
