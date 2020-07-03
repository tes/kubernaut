export default class IngressEntry {

  constructor({ id, name, ingressClass, annotations, rules }) {
    this.id = id;
    this.name = name;
    this.ingressClass = ingressClass;
    this.annotations = annotations;
    this.rules = rules;
  }

}
