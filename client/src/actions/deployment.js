export const FETCH_DEPLOYMENTS_REQUEST = 'FETCH_DEPLOYMENTS_REQUEST';
export const FETCH_DEPLOYMENTS_SUCCESS = 'FETCH_DEPLOYMENTS_SUCCESS';
export const FETCH_DEPLOYMENTS_ERROR = 'FETCH_DEPLOYMENTS_ERROR';
export const FETCH_DEPLOYMENT_REQUEST = 'FETCH_DEPLOYMENT_REQUEST';
export const FETCH_DEPLOYMENT_SUCCESS = 'FETCH_DEPLOYMENT_SUCCESS';
export const FETCH_DEPLOYMENT_ERROR = 'FETCH_DEPLOYMENT_ERROR';

export function fetchDeployments(options = { page: 1, pageSize: 50, quiet: false, }) {
  return async (dispatch) => {
    const limit = options.pageSize;
    const offset = (options.page - 1) * options.pageSize;
    let data = { limit, offset, count: 0, items: [], };
    dispatch({ type: FETCH_DEPLOYMENTS_REQUEST, data, loading: true, });

    try {
      const url = `/api/deployments?limit=${limit}&offset=${offset}`;
      const res = await fetch(url, { method: 'GET', timeout: options.timeout, credentials: 'same-origin', });
      if (res.status >= 400) throw new Error(`${url} returned ${res.status} ${res.statusText}`);
      data = await res.json();
    } catch(error) {
      if (options.quiet !== true) console.error(error); // eslint-disable-line no-console
      return dispatch({ type: FETCH_DEPLOYMENTS_ERROR, data, error, });
    }

    return dispatch({ type: FETCH_DEPLOYMENTS_SUCCESS, data, });
  };
}

export function fetchDeployment(id, options = { quiet: false, }) {
  return async (dispatch) => {
    let data;
    dispatch({ type: FETCH_DEPLOYMENT_REQUEST, data, loading: true, });

    try {
      const url = `/api/deployments/${id}`;
      const res = await fetch(url, { method: 'GET', timeout: options.timeout, credentials: 'same-origin', });
      if (res.status >= 400) throw new Error(`${url} returned ${res.status} ${res.statusText}`);
      data = await res.json();
    } catch(error) {
      if (options.quiet !== true) console.error(error); // eslint-disable-line no-console
      return dispatch({ type: FETCH_DEPLOYMENT_ERROR, data, error, });
    }

    return dispatch({ type: FETCH_DEPLOYMENT_SUCCESS, data, });
  };
}
