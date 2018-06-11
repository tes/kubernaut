const makeRequest = (url, options) =>
  fetch(url, Object.assign({}, {
    credentials: 'same-origin',
    timeout: 5000,
    method: 'GET',
  }, options));

const makeQueryString = (values) => {
  return Object.keys(values).reduce((acc, key) => {
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
