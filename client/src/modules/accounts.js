import { createAction, handleActions } from 'redux-actions';
const actionsPrefix = `KUBERNAUT/ACCOUNTS`;
export const fetchAccountsPagination = createAction(`${actionsPrefix}/FETCH_ACCOUNTS_PAGINATION`);
export const FETCH_ACCOUNTS_REQUEST = createAction(`${actionsPrefix}/FETCH_ACCOUNTS_REQUEST`);
export const FETCH_ACCOUNTS_SUCCESS = createAction(`${actionsPrefix}/FETCH_ACCOUNTS_SUCCESS`);
export const FETCH_ACCOUNTS_ERROR = createAction(`${actionsPrefix}/FETCH_ACCOUNTS_ERROR`);

export function fetchAccounts(options = { page: 1, limit: 50, quiet: false }) {
  return async (dispatch) => {
    const limit = options.limit;
    const offset = (options.page - 1) * options.limit;
    let data = { limit, offset, count: 0, items: [] };
    dispatch(FETCH_ACCOUNTS_REQUEST({ data, loading: true }));

    try {
      const url = `/api/accounts?limit=${limit}&offset=${offset}`;
      const res = await fetch(url, { method: 'GET', timeout: options.timeout, credentials: 'same-origin' });
      if (res.status >= 400) throw new Error(`${url} returned ${res.status} ${res.statusText}`);
      data = await res.json();
    } catch(error) {
      if (options.quiet !== true) console.error(error); // eslint-disable-line no-console
      return dispatch(FETCH_ACCOUNTS_ERROR({ data, error }));
    }

    return dispatch(FETCH_ACCOUNTS_SUCCESS({ data }));
  };
}

const defaultState = {
  data: {
    limit: 0,
    offset: 0,
    count: 0,
    pages: 0,
    page: 0,
    items: [],
  },
  meta: {},
};

export default handleActions({
  [FETCH_ACCOUNTS_REQUEST]: () => ({
    ...defaultState,
    meta: {
      loading: true,
    },
  }),
  [FETCH_ACCOUNTS_SUCCESS]: (state, { payload }) => ({
    ...state,
    data: payload.data,
    meta: {
      loading: false,
    },
  }),
  [FETCH_ACCOUNTS_ERROR]: (state, { payload }) => ({
    ...state,
    meta: {
      error: payload.error,
      loading: false,
    },
  }),
}, defaultState);
