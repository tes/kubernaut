export const idTypes = [
  'secretVersion',
  'namespace',
  'service',
  'release',
  'deployment',
  'account',
  'cluster',
  'registry',
  'team',
  'job',
  'jobVersion',
  'ingressVersion',
];

export default class AuditEntry {

  constructor({ id, createdOn, action, sourceAccount, ids = {} }) {
    this.id = id;
    this.createdOn = createdOn;
    this.action = action;
    this.sourceAccount = sourceAccount;
    this.ids = idTypes.reduce((acc, type) => ({ ...acc, [type]: ids[type] }), {});

    idTypes.forEach(type => this[type] = null);
  }


}
