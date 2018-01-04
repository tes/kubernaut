export const FETCH_RELEASES_REQUEST = 'FETCH_RELEASES_REQUEST';
export const FETCH_RELEASES_SUCCESS = 'FETCH_RELEASES_SUCCESS';
export const FETCH_RELEASES_ERROR = 'FETCH_RELEASES_ERROR';

export function fetchReleases(options = { page: 1, limit: 50, quiet: false, }) {
  return async (dispatch) => {
    const limit = options.limit;
    const offset = (options.page - 1) * options.limit;
    let data = { limit, offset, count: 0, items: [], };
    dispatch({ type: FETCH_RELEASES_REQUEST, data, loading: true, });

    try {
      const url = `/api/releases?limit=${limit}&offset=${offset}`;
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

