import { matchPath } from "react-router";
import { find as _find } from 'lodash';
import { put, select, take } from 'redux-saga/effects';
import { selectAccount, FETCH_ACCOUNT_SUCCESS } from './modules/account';

import { fetchAccountInfo } from './modules/viewAccount';
import { fetchAccountInfo as fetchEditAccountInfo } from './modules/editAccount';
import { initialiseAccountsPage } from './modules/accounts';
import { fetchAccountInfo as fetchEditAccountTeamsInfo } from './modules/editAccountTeams';
import { INITIALISE as initialiseDeploy } from './modules/deploy';
import { fetchDeployment } from './modules/deployment';
import { initialiseDeploymentsPage } from './modules/deployments';
import { initialiseNamespacePage } from './modules/namespace';
import { initForm as initNamespaceEdit } from './modules/namespaceEdit';
import { initialise as initNamespaceManage } from './modules/namespaceManage';
import { fetchNamespacesPagination } from './modules/namespaces';
import { fetchRegistriesPagination } from './modules/registries';
import { initialiseReleasesPage } from './modules/releases';
import { initServiceDetailPage } from './modules/service';
import { initSecretOverview } from './modules/secretOverview';
import { fetchVersion } from './modules/secretVersion';
import { initNewSecretVersion } from './modules/newSecretVersion';
import { initServicesPage } from './modules/services';
import { initServiceStatusPage } from './modules/serviceStatus';
import { initServiceManage } from './modules/serviceManage';
import { initForm as initServiceNamespaceAttrs } from './modules/serviceNamespaceAttrs';
import { initialiseTeamPage } from './modules/team';
import { fetchTeamInfo } from './modules/editTeam';
import { initForm as initTeamAttrs } from './modules/teamAttrs';
import { fetchTeamsPagination } from './modules/teams';
import { fetchJobsPagination } from './modules/jobs';
import { initialiseJobPage } from './modules/job';
import { initHomePage } from './modules/home';
import { initAuditPage } from './modules/audit';

import { INITIALISE as initBuilderTest } from './modules/builderTest';

const paths = {
  account: {
    route: '/accounts/:accountId',
    action: fetchAccountInfo,
  },
  accountEdit: {
    route: '/accounts/:accountId/edit',
    action: fetchEditAccountInfo,
  },
  accounts: {
    route: '/accounts',
    action: initialiseAccountsPage,
  },
  editAccountTeams: {
    route: '/accounts/:accountId/teams',
    action: fetchEditAccountTeamsInfo,
  },
  audit: {
    route: '/audit',
    action: initAuditPage,
  },
  deploy: {
    route: '/deploy',
    action: initialiseDeploy,
  },
  deployment: {
    route: '/deployments/:deploymentId',
    action: fetchDeployment,
  },
  deployments: {
    route: '/deployments',
    action: initialiseDeploymentsPage,
  },
  home: {
    route: '/',
    action: initHomePage,
  },
  jobs: {
    route: '/jobs',
    action: fetchJobsPagination,
  },
  job: {
    route: '/jobs/:id',
    action: initialiseJobPage,
  },
  jobsTest: {
    route: '/jobs-builder',
    action: initBuilderTest,
  },
  namespace: {
    route: '/namespaces/:namespaceId',
    action: initialiseNamespacePage,
  },
  namespaceEdit: {
    route: '/namespaces/:namespaceId/edit',
    action: initNamespaceEdit,
  },
  namespaceManage: {
    route: '/namespaces/:namespaceId/manage',
    action: initNamespaceManage,
  },
  namespaces: {
    route: '/namespaces',
    action: fetchNamespacesPagination,
  },
  newSecretVersion: {
    route: '/services/:registry/:name/manage/secrets/:namespaceId/new',
    action: initNewSecretVersion,
  },
  registries: {
    route: '/registries',
    action: fetchRegistriesPagination,
  },
  releases: {
    route: '/releases',
    action: initialiseReleasesPage,
  },
  secretOverview: {
    route: '/services/:registry/:name/manage/secrets/:namespaceId',
    action: initSecretOverview,
  },
  secretVersion: {
    route: '/services/secrets/view/:version',
    action: fetchVersion,
  },
  service: {
    route: '/services/:registry/:name',
    action: initServiceDetailPage,
  },
  serviceStatus: {
    route: '/services/:registry/:name/status/:namespaceId?',
    action: initServiceStatusPage,
  },
  serviceNamespaceAttrs: {
    route: '/services/:registry/:name/manage/attributes/:namespaceId',
    action: initServiceNamespaceAttrs,
  },
  services: {
    route: '/services',
    action: initServicesPage,
  },
  serviceManage: {
    route: '/services/:registry/:name/manage',
    action: initServiceManage,
  },
  team: {
    route: '/teams/:team',
    action: initialiseTeamPage,
  },
  teamAttrs: {
    route: '/teams/:team/attributes',
    action: initTeamAttrs,
  },
  teamEdit: {
    route: '/teams/:team/edit',
    action: fetchTeamInfo,
  },
  teams: {
    route: '/teams',
    action: fetchTeamsPagination,
  },
};

export default paths;

export function* routesSaga ({ payload }) {
  let match;
  const path = _find(paths, ({ route }) => {
    match = matchPath(payload.location.pathname, { path: route, exact: true });
    return match;
  });
  if (path && path.action) {
    const hasAccountData = !!(yield select(selectAccount)).id;
    if (!hasAccountData) yield take(FETCH_ACCOUNT_SUCCESS);
    yield put(path.action({ match, location: payload.location }));
  }
}
