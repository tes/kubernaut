export default class Account {
  constructor({ id, displayName, avatar, createdOn, createdBy, roles }) {
    this.id = id;
    this.displayName = displayName;
    this.avatar = avatar;
    this.createdOn = createdOn;
    this.createdBy = createdBy;
    this.roles = roles;
  }

  listRegistryIdsWithRole() {
    return Object.keys(this.roles || []).reduce((registries, name) => {
      this.roles[name].registries.forEach((registry) => {
        if (registries[registry]) return registries[registry].push(name);
        registries[registry] = [name];
        return registries;
      });
      return registries;
    }, {});
  }

  listNamespaceIdsWithRole() {
    return Object.keys(this.roles || []).reduce((namespaces, name) => {
      this.roles[name].namespaces.forEach((namespace) => {
        if (namespaces[namespace]) return namespaces[namespace].push(name);
        namespaces[namespace] = [name];
        return namespaces;
      });
      return namespaces;
    }, {});
  }

  listRegistryIdsWithRoleAsObject() {
    return Object.keys(this.roles || []).reduce((registries, name) => {
      this.roles[name].registries.forEach((registry) => {
        if (registries[registry]) {
          registries[registry][name] = true;
          return registries;
        }
        registries[registry] = {
          [name]: true,
        };
        return registries;
      });
      return registries;
    }, {});
  }
}
