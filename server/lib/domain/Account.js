// Some of this file is copied to the client dir
// Thanks create-react-app for blocking me symlinking it or otherwise.

import { deprecate } from 'util';

export default class Account {

  constructor({ id, displayName, avatar, createdOn, createdBy, roles }) {
    this.id = id;
    this.displayName = displayName;
    this.avatar = avatar;
    this.createdOn = createdOn;
    this.createdBy = createdBy;
    this.roles = roles;

    this.listNamespaceIdsWithPermission = deprecate(this.listNamespaceIdsWithPermission, 'Account.listNamespaceIdsWithPermission, use store method instead.');
  }

  hasPermissionOnAccount(accountId) {
    return accountId === this.id;
  }

  listNamespaceIdsWithPermission(permission) {
    return Object.keys(this.roles).reduce((namespaces, name) => {
      if (!this.roles[name].permissions.includes(permission)) return namespaces;
      return namespaces.concat(this.roles[name].namespaces);
    }, []);
  }
}
