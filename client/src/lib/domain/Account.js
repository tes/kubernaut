import {
  hasPermission,
  hasPermissionOnNamespace,
} from './ServerAccount';

export default class Account {
  constructor({ id, displayName, avatar, createdOn, createdBy, roles }) {
    this.id = id;
    this.displayName = displayName;
    this.avatar = avatar;
    this.createdOn = createdOn;
    this.createdBy = createdBy;
    this.roles = roles;
  }

  hasPermission(...args) {
    return hasPermission(this.roles, ...args);
  }

  hasPermissionOnNamespace(...args) {
    return hasPermissionOnNamespace(this.roles, ...args);
  }
}
