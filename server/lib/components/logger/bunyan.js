import bunyan from 'bunyan';
import { omit } from 'lodash';

export default function() {

  let log;

  function start({ pkg }, cb) {
    log = bunyan.createLogger({ name: pkg.name });
    return cb(null, onMessage);
  }

  function onMessage(event) {
    log[event.level](omit(event, ['level', 'message']), event.message);
  }

  return {
    start,
  };
}
