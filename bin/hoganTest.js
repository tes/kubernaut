const hogan = require('hogan.js');

const acceptedTags = ['_v', '_t'];
const acceptedVariables = [
  'service',
  'environment'
];

const strings = [
  { s: '{{service}}.service.{{environment}}.tescloud.com {{^check}}{{#i18n}}No{{/i18n}}{{/check}}', shouldPass: false},
  { s: '{{service}}.service.{{environment}}.tescloud.com', shouldPass: true},
  { s: '{{service}}.service.{{environment}}.tescloud.com\nthis should break', shouldPass: false},
  { s: '{{service.service.{{environment}}.tescloud.com', shouldPass: false},
  { s: '{{}}.service.{{environment}}.tescloud.com', shouldPass: false},
  { s: '', shouldPass: false},
];

function parseAndValidate(raw) {
  const parsed = hogan.parse(hogan.scan(raw));
  if (!parsed.length) {
    throw new Error(`empty.`);
  }

  const hasBannedTags = parsed.filter(({ tag }) => {
    if (!tag) return true;
    return acceptedTags.indexOf(tag) === -1;
  }).length > 0;

  if (hasBannedTags) {
    throw new Error(`contains invalid templating structure.`);
  }

  const hasExtraVariables = parsed.filter(({ tag }) => (tag === '_v')).filter(({ n }) => {
    if (!n) return true;
    return acceptedVariables.indexOf(n) === -1;
  }).length > 0;

  if (hasExtraVariables) {
    throw new Error(`contains invalid variables.`);
  }

  console.info(`[${raw}] - is valid.`);
}

strings.forEach(({ s, shouldPass}) => {
  if (shouldPass) {
    try {
      parseAndValidate(s);
    } catch (e) {
      console.error(e, ' >>>>>> failure.');
    }
  } else {
    let failed = false;
    try {
      parseAndValidate(s);
    } catch (e) {
      console.info(`[${JSON.stringify(s)}] failed (as expected) with: ${e.message}`);

      failed = true; // ie, desired outcome, if not checking the specific failure.
    } finally {
      if (!failed) {
        console.error(`[${JSON.stringify(s)}] has not failed as expected`);
      }
    }
  }
});
