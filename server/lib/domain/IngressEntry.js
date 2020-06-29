export default class IngressEntry {

  constructor({ id, name, ingressClass, annotations }) {
    this.id = id;
    this.name = name;
    this.ingressClass = ingressClass;
    this.annotations = annotations;
  }

}
