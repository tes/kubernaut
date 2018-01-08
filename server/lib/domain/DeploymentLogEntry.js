export default class Deployment {

  constructor({ id, deployment, sequence, writtenOn, writtenTo, content, }) {
    this.id = id;
    this.deployment = deployment;
    this.sequence = sequence;
    this.writtenOn = writtenOn;
    this.writtenTo = writtenTo;
    this.content = content;
  }
}
