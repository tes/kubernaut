export const FETCH_DEPLOYMENTS_REQUEST = 'FETCH_DEPLOYMENTS_REQUEST';
export const FETCH_DEPLOYMENTS_SUCCESS = 'FETCH_DEPLOYMENTS_SUCCESS';
export const FETCH_DEPLOYMENTS_ERROR = 'FETCH_DEPLOYMENTS_ERROR';

export function fetchDeployments(options = { quiet: false, }) {
  return async (dispatch) => {

    let data = [];

    dispatch({ type: FETCH_DEPLOYMENTS_REQUEST, data, loading: true, });

    try {
      const url = '/api/deployments';
      const res = await fetch(url, { method: 'GET', timeout: options.timeout, credentials: 'same-origin', });
      if (res.status >= 400) throw new Error(`${url} returned ${res.status} ${res.statusText}`);
      data = await res.json();
    } catch(error) {
      if (!options.quiet) console.error(error); // eslint-disable-line no-console
      return dispatch({ type: FETCH_DEPLOYMENTS_ERROR, data, error, });
    }

    return dispatch({ type: FETCH_DEPLOYMENTS_SUCCESS, data, });
  };
}

