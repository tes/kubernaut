// Some of this file is copied to the client dir
// Thanks create-react-app for blocking me symlinking it or otherwise.

import has from 'lodash.has';

export default class Account {

  constructor({ id, displayName, avatar, createdOn, createdBy, roles }) {
    this.id = id;
    this.displayName = displayName;
    this.avatar = avatar;
    this.createdOn = createdOn;
    this.createdBy = createdBy;
    this.roles = roles;
  }

  isNamespaceAdmin() {
    return has(this, 'roles.admin.namespaces');
  }

  isRegistryAdmin() {
    return has(this, 'roles.admin.registries');
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
