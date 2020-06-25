export default class ClusterIngressClass {

  constructor({ id, createdOn, createdBy, ingressClass, cluster }) {
    this.id = id;
    this.ingressClass = ingressClass;
    this.cluster = cluster;
    this.createdOn = createdOn;
    this.createdBy = createdBy;
  }

}
