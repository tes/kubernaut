export default class Release {

  constructor({ id, yaml, json, checksum, }) {
    this.id = id;
    this.source = {
      yaml: yaml,
      json: json,
    };
    this.checksum = checksum;
  }
}
