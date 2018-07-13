const makeRequest = async (url, options = {}) => {
  const res = await fetch(url, Object.assign({}, {
    credentials: 'same-origin',
    timeout: 5000,
    method: 'GET',
    headers: {
      'content-type': 'application/json',
    }
  }, options));
  if (options.returnResponse) return res;
  if (res.status >= 400) throw new Error(`${url} returned ${res.status} ${res.statusText}`);
  return await res.json();
};

const makeQueryString = (values) => {
  return Object.keys(values).reduce((acc, key) => {
    if (!values[key] && values[key] !== 0) return acc;
    return `${acc}${key}=${values[key]}&`;
  }, '');
};

const computePagination = result => ({
  ...result,
  pages: result.limit ? Math.ceil(result.count / result.limit) : 0,
  page: result.limit ? Math.floor(result.offset / result.limit) + 1 : 0,
});

export const fetchReleases = ({ limit = 20, offset = 0, service= '', registry = '', version = '' }) => {
  const qs = makeQueryString({
    limit,
    offset,
    service,
    registry,
    version,
  });
  return makeRequest(`/api/releases?${qs}`);
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

export const getRegistries = () => makeRequest('/api/registries');

export const getNamespaces = () => makeRequest('/api/namespaces');

export const getNamespace = (id) => makeRequest(`/api/namespaces/${id}`);

export const fetchLatestDeploymentsByNamespaceForService = ({ registry, service }) => makeRequest(`/api/deployments/latest-by-namespace/${registry}/${service}`);

export const makeDeployment = async (data, options = {}) => {
  const wait = options.wait;
  const qs = makeQueryString({
    wait,
  });
  const url = `/api/deployments?${qs}`;
  try {
    const res = await makeRequest(url, {
      method: 'POST',
      returnResponse: true,
      body: JSON.stringify(data),
    });

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
  } catch(error) {
    throw error;
  }
};
