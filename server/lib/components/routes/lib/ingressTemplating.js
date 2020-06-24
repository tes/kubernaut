import hogan from 'hogan.js';

const acceptedTags = ['_v', '_t'];

export const parseAndValidate = (raw = '', acceptedVariables = []) => {
  const parsed = hogan.parse(hogan.scan(raw));
  if (!parsed.length) {
    throw new Error(`empty.`);
  }

  const hasBannedTags = parsed.filter(({ tag }) => {
    if (!tag) return true;
    return acceptedTags.indexOf(tag) === -1;
  }).length > 0;

  if (hasBannedTags) {
    throw new Error(`Contains invalid templating structure.`);
  }

  const hasExtraVariables = parsed.filter(({ tag }) => (tag === '_v')).filter(({ n }) => {
    if (!n) return true;
    return acceptedVariables.indexOf(n) === -1;
  }).length > 0;

  if (hasExtraVariables) {
    throw new Error(`Contains invalid variables.`);
  }

  return parsed; // Its valid.
};
