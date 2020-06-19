export default class ClusterIngressVariable {

  constructor({ id, createdOn, createdBy, ingressHostVariable, value, cluster }) {
    this.id = id;
    this.ingressHostVariable = ingressHostVariable;
    this.value = value;
    this.cluster = cluster;
    this.createdOn = createdOn;
    this.createdBy = createdBy;
  }

}
