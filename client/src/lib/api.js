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
    const currentLocation = `${window.location.pathname}${window.location.search}`;
    return window.location = `${res.headers.get('Location')}?return=${encodeURIComponent(currentLocation)}`;
  }
  if (options.returnResponse) return res;
  if (res.status >= 400) {
    let message = `${url} returned ${res.status} ${res.statusText}`;
    let serverError;
    try {
      serverError = await res.json();
      if (serverError.message) message = serverError.message;
    } catch(parseError) {
      if (!options.quiet) console.warn('Could not parse server response', res); // eslint-disable-line no-console
    }

    const toThrow = new Error(message);
    if (serverError) toThrow.data = serverError;
    throw toThrow;
  }
  return await res.json();
};

const computePagination = result => ({
  ...result,
  pages: result.limit ? Math.ceil(result.count / result.limit) : 0,
  page: result.limit ? Math.floor(result.offset / result.limit) + 1 : 0,
});

export const getReleases = ({ limit = 20, offset = 0, service, registry, version, filters = {}, sort, order }) => {
  const qs = makeQueryString({
    limit,
    offset,
    service,
    registry,
    version,
    sort,
    order,
    ...stringifyFilters(filters)
  });
  return makeRequest(`/api/releases?${qs}`).then(computePagination);
};

export const getDeployments = ({ limit = 20, offset = 0, service, registry, namespace, cluster, sort, order, filters = {}, hasNotes = null }) => {
  const qs = makeQueryString({
    limit,
    offset,
    service,
    registry,
    namespace,
    cluster,
    sort,
    order,
    hasNotes,
    ...stringifyFilters(filters)
  });

  return makeRequest(`/api/deployments?${qs}`).then(computePagination);
};

export const getAccounts = ({ limit = 20, offset = 0, sort, order, filters = {} }) => {
  const qs = makeQueryString({
    limit,
    offset,
    sort,
    order,
    ...stringifyFilters(filters)
  });

  return makeRequest(`/api/accounts?${qs}`).then(computePagination);
};

export const getAuditEntries = ({ limit = 20, offset = 0, filters = {} }) => {
  const qs = makeQueryString({
    limit,
    offset,
    ...stringifyFilters(filters),
  });

  return makeRequest(`/api/audit?${qs}`).then(computePagination);
};

export const getNamespaceHistoryForRelease = ({ filters = {} }) => {
  const qs = makeQueryString({
    ...stringifyFilters(filters),
  });

  return makeRequest(`/api/deployments/namespaces-history-per-release?${qs}`);
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

export const getService = ({ registry, service }) => makeRequest(`/api/services/${registry}/${service}`);

export const getServicesWithStatusForNamespace = (id, offset, limit) => makeRequest(`/api/services-with-status-for-namespace/${id}?${makeQueryString({ offset, limit })}`)
  .then(computePagination);

export const getLatestDeploymentsByNamespaceForService = ({ registry, service }) => makeRequest(`/api/deployments/latest-by-namespace/${registry}/${service}`);

export const getServiceSuggestions = (registry, service) => makeRequest(`/api/registries/${registry}/search/${service}`);

export const makeDeployment = (data, options = {}) => {
  return makeRequest('/api/deployments', {
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

export const addRoleForSystem = (accountId, role, options = {}) => {
  const url = '/api/roles/system';
  return makeRequest(url, {
    method: 'POST',
    body: JSON.stringify({
      account: accountId,
      role,
    }),
  });
};

export const removeRoleForSystem = (accountId, role, options = {}) => {
  const url = '/api/roles/system';
  return makeRequest(url, {
    method: 'DELETE',
    body: JSON.stringify({
      account: accountId,
      role,
    }),
  });
};

export const addGlobalRole = (accountId, role, options = {}) => {
  const url = '/api/roles/global';
  return makeRequest(url, {
    method: 'POST',
    body: JSON.stringify({
      account: accountId,
      role,
    }),
  });
};

export const removeGlobalRole = (accountId, role, options = {}) => {
  const url = '/api/roles/global';
  return makeRequest(url, {
    method: 'DELETE',
    body: JSON.stringify({
      account: accountId,
      role,
    }),
  });
};

export const enableServiceForNamespace = (namespaceId, serviceId, offset, limit, fetchNamespaces = false) => {
  const qs = makeQueryString({
    offset,
    limit,
    fetchNamespaces,
  });
  const url = `/api/service/${serviceId}/enable-deployment/${namespaceId}?${qs}`;
  return makeRequest(url, {
    method: 'POST',
  }).then(computePagination);
};

export const disableServiceForNamespace = (namespaceId, serviceId, offset, limit, fetchNamespaces = false) => {
  const qs = makeQueryString({
    offset,
    limit,
    fetchNamespaces,
  });
  const url = `/api/service/${serviceId}/disable-deployment/${namespaceId}?${qs}`;
  return makeRequest(url, {
    method: 'DELETE',
  }).then(computePagination);
};

export const updateDeploymentNote = (deploymentId, note) => {
  return makeRequest(`/api/deployments/${deploymentId}/note`, {
    method: 'POST',
    body: JSON.stringify({
      note: note || '',
    }),
  });
};

export const hasPermission = (permission) => {
  const url = `/api/account/hasPermission/${permission}`;
  return makeRequest(url);
};

export const hasPermissionOn = (permission, type, id) => {
  const url = `/api/account/hasPermission/${permission}/on/${type}/${id}`;
  return makeRequest(url);
};

export const getCanManageAnyNamespace = () => {
  const url = '/api/account/hasPermission/namespaces-manage/on-any/namespace';
  return makeRequest(url);
};

export const getAccountRolesForNamesaces = (accountId) => {
  const url = `/api/accounts/${accountId}/namespaces`;
  return makeRequest(url);
};

export const getAccountRolesForRegistries = (accountId) => {
  const url = `/api/accounts/${accountId}/registries`;
  return makeRequest(url);
};

export const getSystemRoles = (accountId) => {
  const url = `/api/accounts/${accountId}/system`;
  return makeRequest(url);
};

export const getServiceNamespacesStatus = (registry, service, offset, limit) => makeRequest(`/api/services/${registry}/${service}/namespace-status?${makeQueryString({ offset, limit })}`)
  .then(computePagination);

export const getSecretVersions = (registry, service, namespaceId, offset, limit) => makeRequest(`/api/secrets/${registry}/${service}/${namespaceId}?${makeQueryString({ offset, limit })}`)
  .then(computePagination);

export const getLatestDeployedSecretVersion = (registry, service, version, namespaceId) => makeRequest(`/api/secrets/${registry}/${service}/${version}/${namespaceId}/latest-deployed`);

export const getSecretVersionWithData = (version) => makeRequest(`/api/secrets/${version}/with-data`);

export const saveSecretVersion = (registry, service, namespace, data) => {
  return makeRequest(`/api/secrets/${registry}/${service}/${namespace}`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
};

export const getServiceAttributesForNamespace = (registry, service, namespaceId) => makeRequest(`/api/service/${registry}/${service}/${namespaceId}/attributes`);

export const setServiceAttributesForNamespace = (registry, service, namespaceId, data) => makeRequest(`/api/service/${registry}/${service}/${namespaceId}/attributes`, {
  method: 'POST',
  body: JSON.stringify(data),
});
