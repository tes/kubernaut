import { matchPath } from "react-router";
import { find as _find } from 'lodash';
import { put } from 'redux-saga/effects';

import { fetchDeployment } from './modules/deployment';
import { initialiseNamespacePage } from './modules/namespace';
import { fetchNamespacesPagination } from './modules/namespaces';
import { fetchRegistriesPagination } from './modules/registries';

const paths = {
  account: {
    route: '/accounts/:accountId'
  },
  accountEdit: {
    route: '/accounts/:accountId/edit'
  },
  accounts: {
    route: '/accounts'
  },
  deploy: {
    route: '/deploy'
  },
  deployment: {
    route: '/deployments/:deploymentId',
    action: fetchDeployment,
  },
  deployments: {
    route: '/deployments'
  },
  home: {
    route: '/'
  },
  namespace: {
    route: '/namespaces/:namespaceId',
    action: initialiseNamespacePage,
  },
  namespaceEdit: {
    route: '/namespaces/:namespaceId/edit'
  },
  namespaceManage: {
    route: '/namespaces/:namespaceId/manage'
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
    route: '/releases'
  },
  service: {
    route: '/services/:registry/:name'
  },
  services: {
    route: '/services'
  },
};

export default paths;

export const doesLocationMatch = (location, pathName) => {
  const path = paths[pathName].route;
  if (!path) return;
  return matchPath(location.pathname, { path, exact: true });
};

export function* routesSaga ({ payload }) {
  let match;
  const path = _find(paths, ({ route }) => {
    match = matchPath(payload.location.pathname, { path: route, exact: true });
    return match;
  });
  if (path && path.action) yield put(path.action({ match, location: payload.location }));
}
