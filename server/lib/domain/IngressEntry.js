export default class IngressEntry {

  constructor({ id, name, ingressClass, rules = [], annotations }) {
    this.id = id;
    this.name = name;
    this.ingressClass = ingressClass;
    this.rules = rules;
    this.annotations = annotations;
  }

}
