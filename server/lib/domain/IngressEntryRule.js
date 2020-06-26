export default class IngressEntryAnnotation {

  constructor({ id, path, port, customHost, ingressHostKey }) {
    this.id = id;
    this.path = path;
    this.port = port;
    this.customHost = customHost;
    this.ingressHostKey = ingressHostKey;
  }

}
