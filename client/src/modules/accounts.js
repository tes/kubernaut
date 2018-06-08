const actionsPrefix = `KUBERNAUT/ACCOUNTS`;
export const FETCH_ACCOUNTS_REQUEST = `${actionsPrefix}/FETCH_ACCOUNTS_REQUEST`;
export const FETCH_ACCOUNTS_SUCCESS = `${actionsPrefix}/FETCH_ACCOUNTS_SUCCESS`;
export const FETCH_ACCOUNTS_ERROR = `${actionsPrefix}/FETCH_ACCOUNTS_ERROR`;

export function fetchAccounts({ criteria, limit, pages, page, quiet = false, timeout }) {
  return async (dispatch) => {
    const offset = (page - 1) * limit;
    const data = { criteria, limit, offset, count: 0, items: [] };
    dispatch({ type: FETCH_ACCOUNTS_REQUEST, data, loading: true });

    try {
      const url = getAccountsUrl(criteria, limit, offset);
      const res = await fetch(url, { method: 'GET', timeout: timeout, credentials: 'same-origin' });
      if (res.status >= 400) throw new Error(`${url} returned ${res.status} ${res.statusText}`);
      const payload = await res.json();
      return dispatch({ type: FETCH_ACCOUNTS_SUCCESS, data: { ...data, ...payload } });
    } catch(error) {
      if (!quiet) console.error(error); // eslint-disable-line no-console
      return dispatch({ type: FETCH_ACCOUNTS_ERROR, data, error });
    }
  };
}

function getAccountsUrl(criteria, limit, offset) {
  return Object.keys(criteria.terms).reduce((url, name) => {
    const params = criteria.terms[name].map((value) => `${name}[]=${value}`).join('&');
    return `${url}&${params}`;
  }, `/api/accounts?limit=${limit}&offset=${offset}`);
}

export default function(state = { data: { criteria: { source: '', terms: {} }, limit: 20, offset: 0, count: 0, pages: 0, page: 1, items: [] }, meta: {} }, action)  {
  switch (action.type) {
    case FETCH_ACCOUNTS_REQUEST:
    case FETCH_ACCOUNTS_SUCCESS:
    case FETCH_ACCOUNTS_ERROR: {
      return {
        ...state,
        data: {
          ...action.data,
          pages: action.data.limit ? Math.ceil(action.data.count / action.data.limit) : 0,
          page: action.data.limit ? Math.floor(action.data.offset / action.data.limit) + 1 : 0,
        },
        meta: {
          error: action.error,
          loading: !!action.loading,
        },
      };
    }
    default: {
      return state;
    }
  }
}
