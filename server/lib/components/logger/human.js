/* eslint-disable no-console */

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
    log: console.log,
  },
  info: {
    colour: chalk.white,
    value: 2,
    log: console.log,
  },
  warn: {
    colour: chalk.yellow,
    value: 3,
    log: console.warn,
  },
  error: {
    colour: chalk.red,
    value: 4,
    log: console.error,
  },
  default: {
    colour: chalk.white,
    value: 1,
    log: console.log,
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

