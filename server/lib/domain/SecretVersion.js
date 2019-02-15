export default class SecretVersion {

  constructor({ id, comment, createdOn, createdBy, service, namespace, secrets, yaml }) {
    this.id = id;
    this.comment = comment;
    this.createdOn = createdOn;
    this.createdBy = createdBy;
    this.service = service;
    this.namespace = namespace;
    this.secrets = secrets;
    this.yaml = yaml;
  }

  setYaml(yaml) {
    this.yaml = yaml;
  }

  setSecrets(secrets) {
    this.secrets = secrets;
  }
}
