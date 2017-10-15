import Chance from 'chance';
import { v4 as uuid, } from 'uuid';

const chance = new Chance();

function makeRelease(overrides = {}) {
  const name = chance.name().toLowerCase().replace(/\s/g, '-');
  const version = `${chance.integer({ min: 1, max: 1000, })}`;
  return {
    id: uuid(),
    name,
    version,
    description: chance.sentence(),
    template: chance.sentence(),
    attributes: {
      template: `${chance.word().toLowerCase()}.yaml`,
      image: `registry/repo/${name}:${version}`,
    },
    ...overrides,
  };
}

function makeMeta(overrides = {}) {
  return {
    date: chance.date(),
    user: chance.first().toLowerCase(),
    ...overrides,
  };
}

export { makeRelease, makeMeta, };
