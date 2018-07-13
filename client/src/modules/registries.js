import { createAction, handleActions } from 'redux-actions';
const actionsPrefix = 'KUBERNAUT/REGISTRIES';
export const fetchRegistriesPagination = createAction(`${actionsPrefix}/FETCH_REGISTRIES_PAGINATION`);
export const FETCH_REGISTRIES_REQUEST = createAction(`${actionsPrefix}/FETCH_REGISTRIES_REQUEST`);
export const FETCH_REGISTRIES_SUCCESS = createAction(`${actionsPrefix}/FETCH_REGISTRIES_SUCCESS`);
export const FETCH_REGISTRIES_ERROR = createAction(`${actionsPrefix}/FETCH_REGISTRIES_ERROR`);

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
  [FETCH_REGISTRIES_REQUEST]: () => ({
    ...defaultState,
    meta: {
      loading: true,
    },
  }),
  [FETCH_REGISTRIES_SUCCESS]: (state, { payload }) => ({
    ...state,
    data: payload.data,
    meta: {
      loading: false,
    },
  }),
  [FETCH_REGISTRIES_ERROR]: (state, { payload }) => ({
    ...state,
    meta: {
      error: payload.error,
      loading: false,
    },
  }),
}, defaultState);
