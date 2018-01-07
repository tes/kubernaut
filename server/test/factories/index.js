import Chance from 'chance';
import { v4 as uuid, } from 'uuid';
import get from 'lodash.get';
import fs from 'fs';
import path from 'path';
import highwayhash from 'highwayhash';
import crypto from 'crypto';
import pm from 'power-merge';
import hogan from 'hogan.js';
import { safeLoadAll as yaml2json, } from 'js-yaml';

import Namespace from '../../lib/domain/Namespace';
import Service from '../../lib/domain/Service';
import ReleaseTemplate from '../../lib/domain/ReleaseTemplate';
import Release from '../../lib/domain/Release';
import Manifest from '../../lib/domain/Manifest';
import Deployment from '../../lib/domain/Deployment';

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
        eq('node.path', 'manifest.yaml'),
        eq('node.path', 'manifest.json'),
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
      eq('node.path', 'manifest.yaml'),
      eq('node.path', 'manifest.json'),
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

function makeNamespace(overrides = {}) {
  return new Namespace(merge({
    name: chance.word({ length: 32, }),
  }, overrides));
}

function makeIdentity(overrides = {}) {
  return merge({
    name: chance.word().toLowerCase(),
    provider: chance.word().toLowerCase(),
    type: chance.word().toLowerCase(),
  }, overrides);
}

function makeAccount(overrides = {}) {
  const first = chance.first();
  const last = chance.last();
  return merge({
    displayName: `${first} ${last}`,
    roles: [],
  }, overrides);
}

function makeService(overrides = {}) {
  return new Service(merge({
    name: chance.name().toLowerCase().replace(/\s/g, '-'),
    namespace: new Namespace({
      name: 'default',
    }),
  }, overrides));
}

function makeRelease(overrides = {}) {
  const service = makeService(overrides.service);
  const version = get(overrides, 'version', `${chance.integer({ min: 1, max: 1000, })}`);
  const yaml = get(overrides, 'template.source.yaml', sampleTemplate);
  const json = get(overrides, 'template.source.json', yaml2json(yaml));

  return new Release(merge({
    service,
    version,
    template: new ReleaseTemplate({
      yaml,
      json,
      checksum: highwayhash.asHexString(key, Buffer.from(yaml)),
    }),
    attributes: {
      template: `${chance.word().toLowerCase()}.yaml`,
      image: `registry/repo/${service.name}:${version}`,
    },
  }, overrides));
}

function makeDeployment(overrides = {}) {
  const release = makeRelease(overrides.release);
  const yaml = get(overrides, 'manifest.yaml', hogan.compile(release.template.source.yaml).render(release.attributes));
  const json = get(overrides, 'manifest.json', yaml2json(yaml));
  const context = get(overrides, 'context', chance.name().toLowerCase().replace(/\s/g, '-'));

  return new Deployment(merge({
    context,
    manifest: new Manifest({ yaml, json, }),
    release,
  }, overrides));
}

function makeMeta(overrides = {}) {
  const account = overrides.account === 'root' ? '00000000-0000-0000-0000-000000000000' : overrides.account;
  return merge({
    date: chance.date(),
    account: uuid(),
  }, overrides, { account: account, });
}

function makeReleaseForm(overrides = {}) {

  const data = makeRelease();

  return merge({
    namespace: data.service.namespace.name,
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

export { makeNamespace, makeIdentity, makeAccount, makeDeployment, makeRelease, makeMeta, makeReleaseForm, };
