import { createAction, handleActions, combineActions } from 'redux-actions';

const actionsPrefix = 'KUBERNAUT/NAMESPACES';
export const FETCH_NAMESPACES_REQUEST = createAction(`${actionsPrefix}/FETCH_NAMESPACES_REQUEST`);
export const FETCH_NAMESPACES_SUCCESS = createAction(`${actionsPrefix}/FETCH_NAMESPACES_SUCCESS`);
export const FETCH_NAMESPACES_ERROR = createAction(`${actionsPrefix}/FETCH_NAMESPACES_ERROR`);

export function fetchNamespaces(options = { page: 1, limit: 50, quiet: false }) {
  return async (dispatch) => {
    const limit = options.limit;
    const offset = (options.page - 1) * options.limit;
    let data = { limit, offset, count: 0, items: [] };
    dispatch(FETCH_NAMESPACES_REQUEST({ data, loading: true }));

    try {
      const url = `/api/namespaces?limit=${limit}&offset=${offset}`;
      const res = await fetch(url, { method: 'GET', timeout: options.timeout, credentials: 'same-origin' });
      if (res.status >= 400) throw new Error(`${url} returned ${res.status} ${res.statusText}`);
      data = await res.json();
    } catch(error) {
      if (options.quiet !== true) console.error(error); // eslint-disable-line no-console
      return dispatch(FETCH_NAMESPACES_ERROR({ data, error }));
    }

    return dispatch(FETCH_NAMESPACES_SUCCESS({ data }));
  };
}

export default handleActions({
  [combineActions(FETCH_NAMESPACES_REQUEST, FETCH_NAMESPACES_SUCCESS, FETCH_NAMESPACES_ERROR)]: (state, { payload }) => ({
    ...state,
    data: {
      ...payload.data,
      pages: payload.data.limit ? Math.ceil(payload.data.count / payload.data.limit) : 0,
      page: payload.data.limit ? Math.floor(payload.data.offset / payload.data.limit) + 1 : 0,
    },
    meta: {
      error: payload.error,
      loading: !!payload.loading,
    },
  }),
}, {
  data: {
    limit: 0,
    offset: 0,
    count: 0,
    pages: 0,
    page: 0,
    items: []
  },
  meta: {},
});
