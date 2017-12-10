export const FETCH_RELEASES_REQUEST = 'FETCH_RELEASES_REQUEST';
export const FETCH_RELEASES_SUCCESS = 'FETCH_RELEASES_SUCCESS';
export const FETCH_RELEASES_ERROR = 'FETCH_RELEASES_ERROR';

export function fetchReleases(options = { quiet: false, }) {
  return async (dispatch) => {

    let data = [];

    dispatch({ type: FETCH_RELEASES_REQUEST, data, loading: true, });

    try {
      const url = '/api/releases';
      const res = await fetch(url, { method: 'GET', timeout: options.timeout, credentials: 'same-origin', });
      if (res.status >= 400) throw new Error(`${url} returned ${res.status} ${res.statusText}`);
      data = await res.json();
    } catch(error) {
      if (!options.quiet) console.error(error); // eslint-disable-line no-console
      return dispatch({ type: FETCH_RELEASES_ERROR, data, error, });
    }

    return dispatch({ type: FETCH_RELEASES_SUCCESS, data, });
  };
}

