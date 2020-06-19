export default class ClusterIngressHost {

  constructor({ id, createdOn, createdBy, ingressHostKey, value, cluster }) {
    this.id = id;
    this.ingressHostKey = ingressHostKey;
    this.value = value;
    this.cluster = cluster;
    this.createdOn = createdOn;
    this.createdBy = createdBy;
  }

}
