export default class Account {

  constructor({ id, displayName, avatar, createdOn, createdBy, roles, }) {
    this.id = id;
    this.displayName = displayName;
    this.avatar = avatar;
    this.createdOn = createdOn;
    this.createdBy = createdBy;
    this.roles = roles;
  }

  hasPermission(namespace, permission) {
    return Object.keys(this.roles).reduce((permissions, name) => {
      if (!(this.roles[name].namespaces.includes('*') || this.roles[name].namespaces.includes(namespace))) return permissions;
      return permissions.concat(this.roles[name].permissions);
    }, []).includes(permission);
  }

  permittedNamespaces(permission) {
    return Object.keys(this.roles).reduce((namespaces, name) => {
      if (!this.roles[name].permissions.includes(permission)) return namespaces;
      return namespaces.concat(this.roles[name].namespaces);
    }, []);
  }

}
