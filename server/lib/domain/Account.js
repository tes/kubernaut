// This file is symlinked to the client dir
import has from 'lodash.has';

export function hasPermission(roles, permission) {
  return Object.keys(roles).reduce((hasPermission, roleName) => {
    return hasPermission || roles[roleName].permissions.includes(permission);
  }, false);
}

export function hasPermissionOnNamespace(roles = {}, namespace, permission) {
  return Object.keys(roles).reduce((permissions, name) => {
    if (!roles[name].namespaces.includes(namespace)) return permissions;
    return permissions.concat(roles[name].permissions);
  }, []).includes(permission);
}

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

  hasPermission(...args) {
    return hasPermission(this.roles, ...args);
  }

  hasPermissionOnAccount(accountId, permission) {
    return this.hasPermission(permission) || accountId === this.id;
  }

  hasPermissionOnNamespace(...args) {
    return hasPermissionOnNamespace(this.roles, ...args);
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
