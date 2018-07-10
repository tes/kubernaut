import { createAction, combineActions, handleActions } from 'redux-actions';
const actionsPrefix = 'KUBERNAUT/REGISTRIES';
export const FETCH_REGISTRIES_REQUEST = createAction(`${actionsPrefix}/FETCH_REGISTRIES_REQUEST`);
export const FETCH_REGISTRIES_SUCCESS = createAction(`${actionsPrefix}/FETCH_REGISTRIES_SUCCESS`);
export const FETCH_REGISTRIES_ERROR = createAction(`${actionsPrefix}/FETCH_REGISTRIES_ERROR`);

export function fetchRegistries(options = { page: 1, limit: 50, quiet: false }) {
  return async (dispatch) => {
    const limit = options.limit;
    const offset = (options.page - 1) * options.limit;
    let data = { limit, offset, count: 0, items: [] };
    dispatch(FETCH_REGISTRIES_REQUEST({ data, loading: true }));

    try {
      const url = `/api/registries?limit=${limit}&offset=${offset}`;
      const res = await fetch(url, { method: 'GET', timeout: options.timeout, credentials: 'same-origin' });
      if (res.status >= 400) throw new Error(`${url} returned ${res.status} ${res.statusText}`);
      data = await res.json();
    } catch(error) {
      if (options.quiet !== true) console.error(error); // eslint-disable-line no-console
      return dispatch(FETCH_REGISTRIES_ERROR({ data, error }));
    }

    return dispatch(FETCH_REGISTRIES_SUCCESS({ data }));
  };
}

export default handleActions({
  [combineActions(FETCH_REGISTRIES_REQUEST, FETCH_REGISTRIES_SUCCESS, FETCH_REGISTRIES_ERROR)]: (state, { payload }) => ({
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
