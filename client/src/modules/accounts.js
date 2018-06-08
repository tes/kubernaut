const actionsPrefix = `KUBERNAUT/ACCOUNTS`;
export const FETCH_ACCOUNTS_REQUEST = `${actionsPrefix}/FETCH_ACCOUNTS_REQUEST`;
export const FETCH_ACCOUNTS_SUCCESS = `${actionsPrefix}/FETCH_ACCOUNTS_SUCCESS`;
export const FETCH_ACCOUNTS_ERROR = `${actionsPrefix}/FETCH_ACCOUNTS_ERROR`;

export function fetchAccounts(options = { page: 1, pageSize: 50, quiet: false }) {
  return async (dispatch) => {
    const limit = options.pageSize;
    const offset = (options.page - 1) * options.pageSize;
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

export default function(state = { data: { limit: 0, offset: 0, count: 0, pages: 0, currentPage: 0, items: [] }, meta: {} }, action)  {
  switch (action.type) {
    case FETCH_ACCOUNTS_REQUEST:
    case FETCH_ACCOUNTS_SUCCESS:
    case FETCH_ACCOUNTS_ERROR: {
      return {
        ...state,
        data: {
          ...action.data,
          pages: action.data.limit ? Math.ceil(action.data.count / action.data.limit) : 0,
          currentPage: action.data.limit ? Math.floor(action.data.offset / action.data.limit) + 1 : 0,
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
