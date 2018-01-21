export default class Registry {

  constructor({ id, name, context, namespaces, createdOn, createdBy, }) {
    this.id = id;
    this.name = name;
    this.context = context;
    this.namespaces = namespaces;
    this.createdOn = createdOn;
    this.createdBy = createdBy;
  }
}
