export const FETCH_ACCOUNTS_REQUEST = 'FETCH_ACCOUNTS_REQUEST';
export const FETCH_ACCOUNTS_SUCCESS = 'FETCH_ACCOUNTS_SUCCESS';
export const FETCH_ACCOUNTS_ERROR = 'FETCH_ACCOUNTS_ERROR';

export function fetchAccounts(options = { page: 1, limit: 50, quiet: false }) {
  return async (dispatch) => {
    const limit = options.limit;
    const offset = (options.page - 1) * limit;
    let data = { limit, offset, count: 0, items: [] };
    dispatch({ type: FETCH_ACCOUNTS_REQUEST, data, loading: true });

    try {
      const url = `/api/accounts?limit=${limit}&offset=${offset}`;
      const res = await fetch(url, { method: 'GET', timeout: options.timeout, credentials: 'same-origin' });
      if (res.status >= 400) throw new Error(`${url} returned ${res.status} ${res.statusText}`);
      data = await res.json();
    } catch(error) {
      if (options.quiet !== true) console.error(error); // eslint-disable-line no-console
      return dispatch({ type: FETCH_ACCOUNTS_ERROR, data, error });
    }

    return dispatch({ type: FETCH_ACCOUNTS_SUCCESS, data });
  };
}
