import { stringify as makeQueryString } from 'querystring';

const stringifyFilters = (filters) => {
  return Object.keys(filters).reduce((acc, key) => {
    return {
      ...acc,
      [key]: filters[key].map((filter) => makeQueryString(filter, ',', ':')),
    };
  }, {});
};

const makeRequest = async (url, options = {}) => {
  const res = await fetch(url, Object.assign({}, {
    credentials: 'same-origin',
    timeout: 5000,
    method: 'GET',
    headers: {
      'content-type': 'application/json',
    }
  }, options));

  if (res.status === 401 && res.headers.has('Location')) {
    return window.location = res.headers.get('Location');
  }
  if (options.returnResponse) return res;
  if (res.status >= 400) {
    let message = `${url} returned ${res.status} ${res.statusText}`;

    try {
      const serverError = await res.json();
      if (serverError.message) message = serverError.message;
    } catch(parseError) {
      if (!options.quiet) console.warn('Could not parse server response', res); // eslint-disable-line no-console
    }

    throw new Error(message);
  }
  return await res.json();
};

const computePagination = result => ({
  ...result,
  pages: result.limit ? Math.ceil(result.count / result.limit) : 0,
  page: result.limit ? Math.floor(result.offset / result.limit) + 1 : 0,
});

export const getReleases = ({ limit = 20, offset = 0, service= '', registry = '', version = '' }) => {
  const qs = makeQueryString({
    limit,
    offset,
    service,
    registry,
    version,
  });
  return makeRequest(`/api/releases?${qs}`).then(computePagination);
};

export const getDeployments = ({ limit = 20, offset = 0, service= '', registry = '', namespace = '' }) => {
  const qs = makeQueryString({
    limit,
    offset,
    service,
    registry,
    namespace,
  });

  return makeRequest(`/api/deployments?${qs}`).then(computePagination);
};

export const getAccounts = ({ limit = 20, offset = 0 }) => {
  const qs = makeQueryString({
    limit,
    offset,
  });

  return makeRequest(`/api/accounts?${qs}`).then(computePagination);
};

export const getRegistries = () => makeRequest('/api/registries').then(computePagination);

export const getServices = ({ offset, limit, sort, order, filters = {} }) =>
  makeRequest(`/api/services?${makeQueryString({ offset, limit, sort, order, ...stringifyFilters(filters) })}`).then(computePagination);

export const getNamespaces = () => makeRequest('/api/namespaces').then(computePagination);

export const getNamespacesForService = (serviceId) => makeRequest(`/api/namespaces/can-deploy-to-for/${serviceId}`).then(computePagination);

export const getClusters = () => makeRequest('/api/clusters').then(computePagination);

export const getNamespace = (id) => makeRequest(`/api/namespaces/${id}`);

export const getDeployment = (id) => makeRequest(`/api/deployments/${id}`);

export const getAccount = () => makeRequest('/api/account');

export const getAccountById = (id) => makeRequest(`/api/accounts/${id}`);

export const getServicesWithStatusForNamespace = (id, offset, limit) => makeRequest(`/api/services-with-status-for-namespace/${id}?${makeQueryString({ offset, limit })}`)
  .then(computePagination);

export const getLatestDeploymentsByNamespaceForService = ({ registry, service }) => makeRequest(`/api/deployments/latest-by-namespace/${registry}/${service}`);

export const getServiceSuggestions = (registry, service) => makeRequest(`/api/registries/${registry}/search/${service}`);

export const makeDeployment = (data, options = {}) => {
  const wait = options.wait;
  const qs = makeQueryString({
    wait,
  });
  const url = `/api/deployments?${qs}`;
  return makeRequest(url, {
    method: 'POST',
    body: JSON.stringify(data),
  });
};

export const editNamespace = (id, data, options = {}) => {
  const url = `/api/namespaces/${id}`;
  return makeRequest(url, {
    method: 'POST',
    body: JSON.stringify(data),
  });
};

export const addRoleForNamespace = (accountId, namespaceId, role, options = {}) => {
  const url = '/api/roles/namespace';
  return makeRequest(url, {
    method: 'POST',
    body: JSON.stringify({
      account: accountId,
      role,
      namespace: namespaceId,
    }),
  });
};

export const removeRoleForNamespace = (accountId, namespaceId, role, options = {}) => {
  const url = '/api/roles/namespace';
  return makeRequest(url, {
    method: 'DELETE',
    body: JSON.stringify({
      account: accountId,
      role,
      namespace: namespaceId,
    }),
  });
};

export const addRoleForRegistry = (accountId, registryId, role, options = {}) => {
  const url = '/api/roles/registry';
  return makeRequest(url, {
    method: 'POST',
    body: JSON.stringify({
      account: accountId,
      role,
      registry: registryId,
    }),
  });
};

export const removeRoleForRegistry = (accountId, registryId, role, options = {}) => {
  const url = '/api/roles/registry';
  return makeRequest(url, {
    method: 'DELETE',
    body: JSON.stringify({
      account: accountId,
      role,
      registry: registryId,
    }),
  });
};

export const enableServiceForNamespace = (namespaceId, serviceId, offset, limit) => {
  const qs = makeQueryString({
    offset,
    limit,
  });
  const url = `/api/service/${serviceId}/enable-deployment/${namespaceId}?${qs}`;
  return makeRequest(url, {
    method: 'POST',
  }).then(computePagination);
};

export const disableServiceForNamespace = (namespaceId, serviceId, offset, limit) => {
  const qs = makeQueryString({
    offset,
    limit,
  });
  const url = `/api/service/${serviceId}/disable-deployment/${namespaceId}?${qs}`;
  return makeRequest(url, {
    method: 'DELETE',
  }).then(computePagination);
};
