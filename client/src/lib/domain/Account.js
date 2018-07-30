export default class Account {
  constructor({ id, displayName, avatar, createdOn, createdBy, roles }) {
    this.id = id;
    this.displayName = displayName;
    this.avatar = avatar;
    this.createdOn = createdOn;
    this.createdBy = createdBy;
    this.roles = roles;
  }

  hasPermission(permission) {
    return Object.keys(this.roles || []).reduce((hasPermission, roleName) => {
      return hasPermission || this.roles[roleName].permissions.includes(permission);
    }, false);
  }

  hasPermissionOnNamespace(namespace, permission) {
    return Object.keys(this.roles || []).reduce((permissions, name) => {
      if (!this.roles[name].namespaces.includes(namespace)) return permissions;
      return permissions.concat(this.roles[name].permissions);
    }, []).includes(permission);
  }

  listRegistryIdsWithRole() {
    return Object.keys(this.roles || []).reduce((registries, name) => {
      this.roles[name].registries.forEach((registry) => {
        if (registries[registry]) return registries[registry].push(name);
        registries[registry] = [name];
      });
      return registries;
    }, {});
  }

  listNamespaceIdsWithRole() {
    return Object.keys(this.roles || []).reduce((namespaces, name) => {
      this.roles[name].namespaces.forEach((namespace) => {
        if (namespaces[namespace]) namespaces[namespace].push(name);
        namespaces[namespace] = [name];
      });
      return namespaces;
    }, {});
  }
}
