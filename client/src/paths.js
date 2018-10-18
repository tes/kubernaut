import { matchPath } from "react-router";
const paths = {
  account: '/accounts/:accountId',
  accountEdit: '/accounts/:accountId/edit',
  accounts: '/accounts',
  deploy: '/deploy',
  deployment: '/deployments/:deploymentId',
  deployments: '/deployments',
  home: '/',
  namespace: '/namespaces/:namespaceId',
  namespaceEdit: '/namespaces/:namespaceId/edit',
  namespaceManage: '/namespaces/:namespaceId/manage',
  namespaces: '/namespaces',
  registries: '/registries',
  releases: '/releases',
  service: '/services/:registry/:name',
  services: '/services',
};

export default paths;

export const doesLocationMatch = (location, pathName) => {
  const path = paths[pathName];
  if (!path) return;
  return matchPath(location.pathname, { path, exact: true });
};
