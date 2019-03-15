export const idTypes = [
  'secretVersion',
  'namespace',
  'service',
  'release',
  'deployment',
  'account',
  'cluster',
  'registry'
];

export default class Deployment {

  constructor({ id, createdOn, action, account, ids = {} }) {
    this.id = id;
    this.createdOn = createdOn;
    this.action = action;
    this.account = account;
    this.ids = idTypes.reduce((acc, type) => ({ ...acc, [type]: ids[type] }), {});

    idTypes.forEach(type => this[type] = null);
  }


}
