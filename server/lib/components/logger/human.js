import chalk from 'chalk';
import hogan from 'hogan.js';
import merge from 'lodash.merge';
import has from 'lodash.has';
import get from 'lodash.get';

const response = hogan.compile('{{{displayTracer}}} {{{displayLevel}}} {{{request.method}}} {{{response.statusCode}}} {{{request.url}}}');
const error = hogan.compile('{{{displayTracer}}} {{{displayLevel}}} {{{message}}} {{{code}}}\n{{{error.stack}}} {{{details}}}');
const info = hogan.compile('{{{displayTracer}}} {{{displayLevel}}} {{{message}}}');

const levels = {
  debug: {
    colour: chalk.gray,
    value: 1,
    log: console.log, // eslint-disable-line no-console
  },
  info: {
    colour: chalk.white,
    value: 2,
    log: console.log, // eslint-disable-line no-console
  },
  warn: {
    colour: chalk.yellow,
    value: 3,
    log: console.warn, // eslint-disable-line no-console
  },
  error: {
    colour: chalk.red,
    value: 4,
    log: console.error, // eslint-disable-line no-console
  },
  default: {
    colour: chalk.white,
    value: 1,
    log: console.log, // eslint-disable-line no-console
  },
};

export default function(options = {}) {

  function start({ config = {} }, cb) {

    function onMessage(event) {
      if (options.suppress) return;
      const level = get(levels, event.level, 'default');
      const enabled = get(levels, config.level, 'default');
      if (level.value < enabled.value) return;

      const data = merge({}, event, {
        displayTracer: has(event, 'tracer') ? event.tracer.substr(0, 6) : '------',
        displayLevel: event.level.toUpperCase(),
      });

      const { colour, log } = level;
      if (has(event, 'error.message')) log(colour(error.render(data)));
      else if (has(event, 'response.statusCode')) log(colour(response.render(data)));
      else log(colour(info.render(data)));
    }

    cb(null, onMessage);
  }

  return {
    start,
  };
}

