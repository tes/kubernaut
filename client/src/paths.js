import { matchPath } from "react-router";
import { find as _find } from 'lodash';
import { put } from 'redux-saga/effects';

import { fetchAccountInfo } from './modules/viewAccount';
import { fetchAccountInfo as fetchEditAccountInfo } from './modules/editAccount';
import { initialiseAccountsPage } from './modules/accounts';
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
import { initServicesPage } from './modules/services';
import { initServiceManage } from './modules/serviceManage';

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
    route: '/'
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
  services: {
    route: '/services',
    action: initServicesPage,
  },
  serviceManage: {
    route: '/services/:registry/:name/manage',
    action: initServiceManage,
  },
};

export default paths;

export function* routesSaga ({ payload }) {
  let match;
  const path = _find(paths, ({ route }) => {
    match = matchPath(payload.location.pathname, { path: route, exact: true });
    return match;
  });
  if (path && path.action) yield put(path.action({ match, location: payload.location }));
}
