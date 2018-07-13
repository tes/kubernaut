import { createAction, handleActions } from 'redux-actions';

const actionsPrefix = 'KUBERNAUT/NAMESPACES';
export const fetchNamespacesPagination = createAction(`${actionsPrefix}/FETCH_NAMESPACES_PAGINATION`);
export const FETCH_NAMESPACES_REQUEST = createAction(`${actionsPrefix}/FETCH_NAMESPACES_REQUEST`);
export const FETCH_NAMESPACES_SUCCESS = createAction(`${actionsPrefix}/FETCH_NAMESPACES_SUCCESS`);
export const FETCH_NAMESPACES_ERROR = createAction(`${actionsPrefix}/FETCH_NAMESPACES_ERROR`);

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
  [FETCH_NAMESPACES_REQUEST]: () => ({
    ...defaultState,
    meta: {
      loading: true,
    },
  }),
  [FETCH_NAMESPACES_SUCCESS]: (state, { payload }) => ({
    ...state,
    data: payload.data,
    meta: {
      loading: false,
    },
  }),
  [FETCH_NAMESPACES_ERROR]: (state, { payload }) => ({
    ...state,
    meta: {
      error: payload.error,
      loading: false,
    },
  }),
}, defaultState);
