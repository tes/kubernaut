export default class Deployment {

  constructor({ id, release, context, manifest, log, createdOn, createdBy, deletedOn, deletedBy, }) {
    this.id = id;
    this.release = release;
    this.context = context;
    this.manifest = manifest;
    this.log = log;
    this.createdOn = createdOn;
    this.createdBy = createdBy;
    this.deletedOn = deletedOn;
    this.deletedBy = createdBy;
  }
}
