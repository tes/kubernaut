import chalk from 'chalk';
import hogan from 'hogan.js';
import merge from 'lodash.merge';
import has from 'lodash.has';

const response = hogan.compile('{{{displayTracer}}} {{{displayLevel}}} {{package.name}} {{{request.method}}} {{{response.statusCode}}} {{{request.url}}}');
const error = hogan.compile('{{{displayTracer}}} {{{displayLevel}}} {{package.name}} {{{message}}} {{{code}}}\n{{{error.stack}}} {{{details}}}');
const info = hogan.compile('{{{displayTracer}}} {{{displayLevel}}} {{package.name}} {{{message}}}');

const colours = {
    debug: chalk.gray,
    info: chalk.white,
    warn: chalk.yellow,
    error: chalk.red,
    default: chalk.white,
};

export default function(options = {}) {

  function start(cb) {
    cb(null, onMessage);
  }

  function onMessage(event) {
    if (options.suppress) return;
    const data = merge({}, event, {
      displayTracer: has(event, 'tracer') ? event.tracer.substr(0, 6) : '------',
      displayLevel: event.level.toUpperCase(),
    });
    const colour = colours[event.level] || colours.default;
    const log = console[event.level] || console.info; // eslint-disable-line no-console

    if (has(event, 'error.message')) log(colour(error.render(data)));
    else if (process.env.APP_ENV === 'test') return;
    else if (has(event, 'response.statusCode')) log(colour(response.render(data)));
    else log(colour(info.render(data)));
  }

  return {
    start,
  };
}

