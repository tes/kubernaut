export default class ClusterIngressVariable {

  constructor({ id, createdOn, createdBy, ingressVariableKey, value, cluster }) {
    this.id = id;
    this.ingressVariableKey = ingressVariableKey;
    this.value = value;
    this.cluster = cluster;
    this.createdOn = createdOn;
    this.createdBy = createdBy;
  }

}
