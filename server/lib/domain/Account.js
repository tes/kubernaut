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

    this.hasPermission = deprecate(this.hasPermission, 'Account.hasPermission, use store method instead.');
    this.hasPermissionOnAccount = deprecate(this.hasPermissionOnAccount, 'Account.hasPermissionOnAccount, use store method instead.');
    this.hasPermissionOnNamespace = deprecate(this.hasPermissionOnNamespace, 'Account.hasPermissionOnNamespace, use store method instead.');
    this.hasPermissionOnRegistry = deprecate(this.hasPermissionOnRegistry, 'Account.hasPermissionOnRegistry, use store method instead.');
    this.listRegistryIdsWithPermission = deprecate(this.listRegistryIdsWithPermission, 'Account.listRegistryIdsWithPermission, use store method instead.');
    this.listNamespaceIdsWithPermission = deprecate(this.listNamespaceIdsWithPermission, 'Account.listNamespaceIdsWithPermission, use store method instead.');
  }

  hasPermission(permission) {
    return Object.keys(this.roles).reduce((hasPermission, roleName) => {
      return hasPermission || this.roles[roleName].permissions.includes(permission);
    }, false);
  }

  hasPermissionOnAccount(accountId, permission) {
    return this.hasPermission(permission) || accountId === this.id;
  }

  hasPermissionOnNamespace(namespace, permission) {
    return Object.keys(this.roles).reduce((permissions, name) => {
      if (!this.roles[name].namespaces.includes(namespace)) return permissions;
      return permissions.concat(this.roles[name].permissions);
    }, []).includes(permission);
  }

  hasPermissionOnRegistry(registry, permission) {
    return Object.keys(this.roles).reduce((permissions, name) => {
      if (!this.roles[name].registries.includes(registry)) return permissions;
      return permissions.concat(this.roles[name].permissions);
    }, []).includes(permission);
  }

  listRegistryIdsWithPermission(permission) {
    return Object.keys(this.roles).reduce((registries, name) => {
      if (!this.roles[name].permissions.includes(permission)) return registries;
      return registries.concat(this.roles[name].registries);
    }, []);
  }

  listNamespaceIdsWithPermission(permission) {
    return Object.keys(this.roles).reduce((namespaces, name) => {
      if (!this.roles[name].permissions.includes(permission)) return namespaces;
      return namespaces.concat(this.roles[name].namespaces);
    }, []);
  }
}
