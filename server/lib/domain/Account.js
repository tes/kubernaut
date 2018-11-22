// Some of this file is copied to the client dir
// Thanks create-react-app for blocking me symlinking it or otherwise.

export default class Account {

  constructor({ id, displayName, avatar, createdOn, createdBy, roles }) {
    this.id = id;
    this.displayName = displayName;
    this.avatar = avatar;
    this.createdOn = createdOn;
    this.createdBy = createdBy;
    this.roles = roles;
  }

  hasPermissionOnAccount(accountId) {
    return accountId === this.id;
  }
}
