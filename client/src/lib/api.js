const makeRequest = (url, options) =>
  fetch(url, Object.assign({}, {
    credentials: 'same-origin',
    timeout: 5000,
    method: 'GET',
    headers: {
      'content-type': 'application/json',
    }
  }, options));

const makeQueryString = (values) => {
  return Object.keys(values).reduce((acc, key) => {
    if (!values[key]) return acc;
    return `${acc}${key}=${values[key]}&`;
  }, '');
};

export const fetchReleases = async ({ limit = 20, offset = 0, service= '', registry = '' }) => {

  const qs = makeQueryString({
    limit,
    offset,
    service,
    registry,
  });

  const url = `/api/releases?${qs}`;

  try {
    const res = await makeRequest(url);
    if (res.status >= 400) throw new Error(`${url} returned ${res.status} ${res.statusText}`);
    return await res.json();
  } catch(error) {
    throw error;
  }
};

export const fetchDeployments = async ({ limit = 20, offset = 0, service= '', registry = '' }) => {

  const qs = makeQueryString({
    limit,
    offset,
    service,
    registry,
  });

  const url = `/api/deployments?${qs}`;

  try {
    const res = await makeRequest(url);
    if (res.status >= 400) throw new Error(`${url} returned ${res.status} ${res.statusText}`);
    return await res.json();
  } catch(error) {
    throw error;
  }
};

export const makeDeployment = async (data, options = {}) => {
  const wait = options.wait;
  const qs = makeQueryString({
    wait,
  });
  const url = `/api/deployments?${qs}`;
  try {
    const res = await makeRequest(url, {
      method: 'POST',
      body: JSON.stringify(data),
    });

    if (res.status >= 400) {
      let message = `${url} returned ${res.status} ${res.statusText}`;
      try {
        const serverError = await res.json();
        if (serverError.message) message = serverError.message;
      } catch(parseError) {
        console.warn('Could not parse server response', res);
      }

      throw new Error(message);
    }
    return await res.json();
  } catch(error) {
    throw error;
  }
};
