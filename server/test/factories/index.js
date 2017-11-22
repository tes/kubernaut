import Chance from 'chance';
import get from 'lodash.get';
import fs from 'fs';
import path from 'path';
import highwayhash from 'highwayhash';
import crypto from 'crypto';
import pm from 'power-merge';
import hogan from 'hogan.js';
import { safeLoadAll as yaml2json, } from 'js-yaml';

const key = crypto.randomBytes(32);
const chance = new Chance();
const sampleTemplatePath = path.join(__dirname, 'data', 'kubernetes.yaml');
const sampleTemplate = fs.readFileSync(sampleTemplatePath, 'utf-8');

const { deepClone, } = pm.ruleSets;
const { and, or, eq, ne, reference, } = pm.commands;
const shallow = [
  {
    when: and([
      ne('a.value', undefined),
      or([
        eq('node.path', 'template.value'),
        eq('node.path', 'template.source.yaml'),
        eq('node.path', 'template.source.json'),
        eq('node.path', 'release.template.source.yaml'),
        eq('node.path', 'release.template.source.json'),
      ]),
    ]),
    then: reference('a.value'),
  },
  {
    when: or([
      eq('node.path', 'template.value'),
      eq('node.path', 'template.source.yaml'),
      eq('node.path', 'template.source.json'),
      eq('node.path', 'release.template.source.yaml'),
      eq('node.path', 'release.template.source.json'),
    ]),
    then: reference('b.value'),
  },
];

const merge = pm.compile({
  api: {
    direction: 'right-to-left',
  }, rules: [
    shallow,
    deepClone,
  ], });

function makeDeployment(overrides = {}) {
  const release = makeRelease(overrides.release);
  const yaml = get(overrides, 'manifest.yaml', hogan.compile(release.template.source.yaml).render(release.attributes));
  const json = get(overrides, 'manifest.json', yaml2json(yaml));
  const context = get(overrides, 'context', chance.name().toLowerCase().replace(/\s/g, '-'));

  return merge({
    context,
    manifest: {
      yaml,
      json,
    },
    release,
  }, overrides);
}

function makeRelease(overrides = {}) {
  const name = get(overrides, 'service.name', chance.name().toLowerCase().replace(/\s/g, '-'));
  const version = get(overrides, 'version', `${chance.integer({ min: 1, max: 1000, })}`);
  const yaml = get(overrides, 'template.source.yaml', sampleTemplate);
  const json = get(overrides, 'template.source.json', yaml2json(yaml));

  return merge({
    service: {
      name,
    },
    version,
    template: {
      source: {
        yaml,
        json,
      },
      checksum: highwayhash.asHexString(key, Buffer.from(yaml)),
    },
    attributes: {
      template: `${chance.word().toLowerCase()}.yaml`,
      image: `registry/repo/${name}:${version}`,
    },
  }, overrides);
}

function makeMeta(overrides = {}) {
  return merge({
    date: chance.date(),
    user: chance.first().toLowerCase(),
  }, overrides);
}

function makeReleaseForm(overrides = {}) {

  const data = makeRelease();

  return merge({
    service: data.service.name,
    version: data.version,
    image: data.attributes.image,
    template: {
      value:  fs.createReadStream(sampleTemplatePath),
      options: {
        filename: 'kubernetes.yaml',
        contentType: 'application/x-yaml',
      },
    },
  }, overrides);
}

export { makeDeployment, makeRelease, makeMeta, makeReleaseForm, };
