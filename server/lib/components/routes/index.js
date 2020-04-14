import systemic from 'systemic';
import system from './system';
import app from './app';
import accounts from './accounts';
import audit from './audit';
import clusters from './clusters';
import deployments from './deployments';
import jobs from './jobs';
import namespaces from './namespaces';
import registries from './registries';
import releases from './releases';
import secrets from './secrets';
import services from './services';
import teams from './teams';

const minimumRequirements = [
  'config',
  'logger',
  'app',
  {
    component: 'logger.middleware',
    destination: 'loggerMiddleware'
  },
  'broadcast'
];

export default () => systemic({
    name: 'routes'
  })
  .add('routes.system', system())
    .dependsOn(...minimumRequirements, 'pkg')
  .add('routes.accounts', accounts())
    .dependsOn(...minimumRequirements, 'store', 'auth')
  .add('routes.audit', audit())
    .dependsOn(...minimumRequirements, 'store', 'auth')
  .add('routes.clusters', clusters())
    .dependsOn(...minimumRequirements, 'store', 'kubernetes', 'auth')
  .add('routes.deployments', deployments())
    .dependsOn(...minimumRequirements, 'store', 'kubernetes', 'auth')
  .add('routes.jobs', jobs())
    .dependsOn(...minimumRequirements, 'store', 'auth', 'kubernetes')
  .add('routes.namespaces', namespaces())
    .dependsOn(...minimumRequirements, 'store', 'kubernetes', 'auth')
  .add('routes.registries', registries())
    .dependsOn(...minimumRequirements, 'store', 'auth')
  .add('routes.releases', releases())
    .dependsOn(...minimumRequirements, 'store', 'checksum', 'kubernetes', 'auth')
  .add('routes.secrets', secrets())
    .dependsOn(...minimumRequirements, 'store', 'auth')
  .add('routes.services', services())
    .dependsOn(...minimumRequirements, 'store', 'auth', 'kubernetes')
  .add('routes.teams', teams())
    .dependsOn(...minimumRequirements, 'store', 'auth')
  .add('routes.app', app())
    .dependsOn(...minimumRequirements, 'auth', 'passport')
  .add('routes')
    .dependsOn(
      'routes.system',
      'routes.accounts',
      'routes.audit',
      'routes.clusters',
      'routes.deployments',
      'routes.jobs',
      'routes.namespaces',
      'routes.registries',
      'routes.releases',
      'routes.secrets',
      'routes.services',
      'routes.teams',
      'routes.app'
    );
