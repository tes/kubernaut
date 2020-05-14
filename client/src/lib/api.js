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
  if (res.status === 204) return;
  return await res.json();
};

const computePagination = result => ({
  ...result,
  pages: result.limit ? Math.ceil(result.count / result.limit) : 0,
  page: result.limit ? Math.floor(result.offset / result.limit) + 1 : 0,
});

export const hasPermission = (permission) => {
  const url = `/api/account/hasPermission/${permission}`;
  return makeRequest(url);
};

export const hasPermissionOn = (permission, type, id) => {
  const url = `/api/account/hasPermission/${permission}/on/${type}/${id}`;
  return makeRequest(url);
};

export const withPermission = (permission, type) => {
  const url = `/api/account/withPermission/${permission}/on/${type}`;
  return makeRequest(url);
};


export const getAccount = () => makeRequest('/api/account');

export const getAccountById = (id) => makeRequest(`/api/accounts/${id}`);

export const getAccountRolesForNamesaces = (accountId) => {
  const url = `/api/accounts/${accountId}/namespaces`;
  return makeRequest(url);
};

export const getAccountRolesForRegistries = (accountId) => {
  const url = `/api/accounts/${accountId}/registries`;
  return makeRequest(url);
};

export const getAccountRolesForTeams = (accountId) => {
  const url = `/api/accounts/${accountId}/teams`;
  return makeRequest(url);
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

export const getAccountTeamMembership = (accountId) => makeRequest(`/api/accounts/${accountId}/team-membership`);

export const getAccountsWithNoMembership = ({ limit = 20, offset = 0 }) => {
  const qs = makeQueryString({
    limit,
    offset,
  });

  return makeRequest(`/api/accounts/with-no-membership?${qs}`).then(computePagination);
};

export const getAuditEntries = ({ limit = 20, offset = 0, filters = {} }) => {
  const qs = makeQueryString({
    limit,
    offset,
    ...stringifyFilters(filters),
  });

  return makeRequest(`/api/audit?${qs}`).then(computePagination);
};

export const getBearerTokenForAccount = (accountId) => makeRequest(`/api/accounts/${accountId}/bearer`);

export const getCanManageAnyNamespace = () => {
  const url = '/api/account/hasPermission/namespaces-manage/on-any/namespace';
  return makeRequest(url);
};

export const getCanManageAnyTeam = () => {
  const url = '/api/account/hasPermission/teams-manage/on-any/team';
  return makeRequest(url);
};

export const getClusters = () => makeRequest('/api/clusters').then(computePagination);

export const getDeployment = (id) => makeRequest(`/api/deployments/${id}`);

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

export const getJob = (id) => makeRequest(`/api/jobs/${id}`);

export const getJobs = ({ limit = 20, offset = 0, filters = {}, sort, order }) => {
  const qs = makeQueryString({
    limit,
    offset,
    sort,
    order,
    ...stringifyFilters(filters)
  });
  return makeRequest(`/api/jobs?${qs}`).then(computePagination);
};

export const getJobSnapshot = (id) => makeRequest(`/api/jobs/${id}/snapshot`);

export const getJobVersion = (id) => makeRequest(`/api/jobs/version/${id}`);

export const getJobVersions = ({ id, limit = 20, offset = 0, sort, order }) => {
  const qs = makeQueryString({
    limit,
    offset,
    sort,
    order,
  });
  return makeRequest(`/api/jobs/${id}/versions?${qs}`).then(computePagination);
};

export const getLatestDeployedSecretVersion = (registry, service, version, namespaceId) => makeRequest(`/api/secrets/${registry}/${service}/${version}/${namespaceId}/latest-deployed`);

export const getLatestDeploymentsByNamespaceForService = ({ registry, service, includeFailed }) => {
  let url = `/api/deployments/latest-by-namespace/${registry}/${service}`;
  if (includeFailed) url = `${url}?includeFailed=true`;

  return makeRequest(url);
};

export const getNamespace = (id) => makeRequest(`/api/namespaces/${id}`);

export const getNamespaces = () => makeRequest('/api/namespaces').then(computePagination);

export const getNamespaceHistoryForRelease = ({ filters = {} }) => {
  const qs = makeQueryString({
    ...stringifyFilters(filters),
  });

  return makeRequest(`/api/deployments/namespaces-history-per-release?${qs}`);
};

export const getNamespacesForService = (serviceId) => makeRequest(`/api/namespaces/can-deploy-to-for/${serviceId}`).then(computePagination);

export const getPreviewOfJobVersion = (values) => {
  const url = '/api/jobs/preview-values';
  return makeRequest(url, {
    method: 'POST',
    body: JSON.stringify(values),
  });
};

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

export const getRegistries = () => makeRequest('/api/registries').then(computePagination);

export const getSecretVersions = (registry, service, namespaceId, offset, limit) => makeRequest(`/api/secrets/${registry}/${service}/${namespaceId}?${makeQueryString({ offset, limit })}`)
.then(computePagination);

export const getSecretVersionWithData = (version) => makeRequest(`/api/secrets/${version}/with-data`);

export const getService = ({ registry, service }) => makeRequest(`/api/services/${registry}/${service}`);

export const getServices = ({ offset, limit, sort, order, filters = {} }) =>
  makeRequest(`/api/services?${makeQueryString({ offset, limit, sort, order, ...stringifyFilters(filters) })}`).then(computePagination);

export const getServiceAttributesForNamespace = (registry, service, namespaceId) => makeRequest(`/api/service/${registry}/${service}/${namespaceId}/attributes`);

export const getServiceNamespacesStatus = (registry, service, offset, limit) => makeRequest(`/api/services/${registry}/${service}/namespace-status?${makeQueryString({ offset, limit })}`)
  .then(computePagination);

export const getServiceSuggestions = (registry, service) => makeRequest(`/api/registries/${registry}/search/${service}`);

export const getServicesWithNoTeam = ({ limit = 20, offset = 0 }) => {
  const qs = makeQueryString({
    limit,
    offset,
  });

  return makeRequest(`/api/services/with-no-team?${qs}`).then(computePagination);
};

export const getServicesWithStatusForNamespace = (id, offset, limit) => makeRequest(`/api/services-with-status-for-namespace/${id}?${makeQueryString({ offset, limit })}`)
  .then(computePagination);

export const getStatusForService = ({ service, registry, namespaceId }) => makeRequest(`/api/services/${registry}/${service}/${namespaceId}/snapshot`);

export const getSystemRoles = (accountId) => {
    const url = `/api/accounts/${accountId}/system`;
    return makeRequest(url);
  };

export const getTeams = ({ offset, limit }) => makeRequest(`/api/teams?${makeQueryString({ offset, limit })}`).then(computePagination);

export const getTeamByName = (name) => makeRequest(`/api/teams/by-name/${name}`);

export const getTeamForService = ({ registry, service }) => makeRequest(`/api/teams/for/${registry}/${service}`);

export const getTeamMembers = ({ offset, limit, teamId }) =>
  makeRequest(`/api/teams/${teamId}/members?${makeQueryString({ offset, limit })}`).then(computePagination);

export const getTeamRolesForNamespaces = (teamId) => {
  const url = `/api/teams/${teamId}/namespaces`;
  return makeRequest(url);
};

export const getTeamRolesForRegistries = (teamId) => {
  const url = `/api/teams/${teamId}/registries`;
  return makeRequest(url);
};

export const getTeamRolesForTeams = (teamId) => {
  const url = `/api/teams/${teamId}/teams`;
  return makeRequest(url);
};

export const getTeamServices = ({ offset, limit, teamId }) =>
  makeRequest(`/api/teams/${teamId}/services?${makeQueryString({ offset, limit })}`).then(computePagination);

export const getTeamSystemRoles = (teamId) => {
  const url = `/api/teams/${teamId}/system`;
  return makeRequest(url);
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

export const addRoleForTeam = (accountId, teamId, role, options = {}) => {
  const url = '/api/roles/team';
  return makeRequest(url, {
    method: 'POST',
    body: JSON.stringify({
      account: accountId,
      role,
      team: teamId,
    }),
  });
};

export const addTeamRoleForNamespace = (teamId, namespaceId, role, options = {}) => {
  const url = '/api/teams/roles/namespace';
  return makeRequest(url, {
    method: 'POST',
    body: JSON.stringify({
      team: teamId,
      role,
      namespace: namespaceId,
    }),
  });
};

export const addTeamRoleForRegistry = (teamId, registryId, role, options = {}) => {
  const url = '/api/teams/roles/registry';
  return makeRequest(url, {
    method: 'POST',
    body: JSON.stringify({
      team: teamId,
      role,
      registry: registryId,
    }),
  });
};

export const addTeamRoleForSystem = (teamId, role, options = {}) => {
  const url = '/api/teams/roles/system';
  return makeRequest(url, {
    method: 'POST',
    body: JSON.stringify({
      team: teamId,
      role,
    }),
  });
};

export const addTeamRoleForTeam = (teamId, subjectTeamId, role, options = {}) => {
  const url = '/api/teams/roles/team';
  return makeRequest(url, {
    method: 'POST',
    body: JSON.stringify({
      team: teamId,
      role,
      subjectTeam: subjectTeamId,
    }),
  });
};

export const addTeamGlobalRole = (teamId, role, options = {}) => {
  const url = '/api/teams/roles/global';
  return makeRequest(url, {
    method: 'POST',
    body: JSON.stringify({
      team: teamId,
      role,
    }),
  });
};

export const addTeamMembershipToAccount = (accountId, teamId) => {
  const url = '/api/roles/team-membership';
  return makeRequest(url, {
    method: 'POST',
    body: JSON.stringify({
      account: accountId,
      team: teamId,
    }),
  });
};

export const associateServiceWithTeam = (serviceId, teamId) => {
  return makeRequest('/api/teams/association/service', {
    method: 'POST',
    body: JSON.stringify({
      service: serviceId,
      team: teamId,
    }),
  });
};

export const applyJobVersion = (jobVersion) => {
  return makeRequest(`/api/jobs/version/${jobVersion.id}/apply`, {
    method: 'POST',
  });
};

export const deleteAccount = (accountId) => {
  return makeRequest(`/api/accounts/${accountId}`, {
    method: 'DELETE'
  });
};

export const deleteService = (registry, service) => {
  return makeRequest(`/api/services/${registry}/${service}`, {
    method: 'DELETE'
  });
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

export const disassociateService = (serviceId) => {
  return makeRequest('/api/teams/association/service', {
    method: 'DELETE',
    body: JSON.stringify({
      service: serviceId,
    }),
  });
};

export const editNamespace = (id, data, options = {}) => {
  const url = `/api/namespaces/${id}`;
  return makeRequest(url, {
    method: 'POST',
    body: JSON.stringify(data),
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

export const makeDeployment = (data, options = {}) => {
  return makeRequest('/api/deployments', {
    method: 'POST',
    body: JSON.stringify(data),
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

export const removeRoleForTeam = (accountId, teamId, role, options = {}) => {
  const url = '/api/roles/team';
  return makeRequest(url, {
    method: 'DELETE',
    body: JSON.stringify({
      account: accountId,
      role,
      team: teamId,
    }),
  });
};

export const removeTeamGlobalRole = (teamId, role, options = {}) => {
  const url = '/api/teams/roles/global';
  return makeRequest(url, {
    method: 'DELETE',
    body: JSON.stringify({
      team: teamId,
      role,
    }),
  });
};

export const removeTeamMembershipFromAccount = (accountId, teamId) => {
  const url = '/api/roles/team-membership';
  return makeRequest(url, {
    method: 'DELETE',
    body: JSON.stringify({
      account: accountId,
      team: teamId,
    }),
  });
};

export const removeTeamRoleForNamespace = (teamId, namespaceId, role, options = {}) => {
  const url = '/api/teams/roles/namespace';
  return makeRequest(url, {
    method: 'DELETE',
    body: JSON.stringify({
      team: teamId,
      role,
      namespace: namespaceId,
    }),
  });
};

export const removeTeamRoleForRegistry = (teamId, registryId, role, options = {}) => {
  const url = '/api/teams/roles/registry';
  return makeRequest(url, {
    method: 'DELETE',
    body: JSON.stringify({
      team: teamId,
      role,
      registry: registryId,
    }),
  });
};

export const removeTeamRoleForSystem = (teamId, role, options = {}) => {
  const url = '/api/teams/roles/system';
  return makeRequest(url, {
    method: 'DELETE',
    body: JSON.stringify({
      team: teamId,
      role,
    }),
  });
};

export const removeTeamRoleForTeam = (teamId, subjectTeamId, role, options = {}) => {
  const url = '/api/teams/roles/team';
  return makeRequest(url, {
    method: 'DELETE',
    body: JSON.stringify({
      team: teamId,
      role,
      subjectTeam: subjectTeamId,
    }),
  });
};

export const saveJob = (name, namespace, registry) => {
  return makeRequest('/api/jobs', {
    method: 'POST',
    body: JSON.stringify({
      name,
      namespace,
      registry,
    }),
  });
};

export const saveJobVersion = (job, data) => {
  return makeRequest(`/api/jobs/${job.id}/version`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
};

export const saveNamespace = (name, cluster, context) => {
  return makeRequest('/api/namespaces', {
    method: 'POST',
    body: JSON.stringify({
      name,
      cluster,
      context,
    }),
  });
};

export const saveSecretVersion = (registry, service, namespace, data) => {
  return makeRequest(`/api/secrets/${registry}/${service}/${namespace}`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
};

export const setServiceAttributesForNamespace = (registry, service, namespaceId, data) => makeRequest(`/api/service/${registry}/${service}/${namespaceId}/attributes`, {
  method: 'POST',
  body: JSON.stringify(data),
});

export const setTeamAttributes = (teamId, data) => makeRequest(`/api/teams/${teamId}/attributes`, {
  method: 'POST',
  body: JSON.stringify(data),
});

export const updateDeploymentNote = (deploymentId, note) => {
  return makeRequest(`/api/deployments/${deploymentId}/note`, {
    method: 'POST',
    body: JSON.stringify({
      note: note || '',
    }),
  });
};
