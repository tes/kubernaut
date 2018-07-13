import { createAction, handleActions } from 'redux-actions';
const actionsPrefix = 'KUBERNAUT/RELEASES';
export const fetchReleasesPagination = createAction(`${actionsPrefix}/FETCH_RELEASES_PAGINATION`);
export const FETCH_RELEASES_REQUEST = createAction(`${actionsPrefix}/FETCH_RELEASES_REQUEST`);
export const FETCH_RELEASES_SUCCESS = createAction(`${actionsPrefix}/FETCH_RELEASES_SUCCESS`);
export const FETCH_RELEASES_ERROR = createAction(`${actionsPrefix}/FETCH_RELEASES_ERROR`);

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
  [FETCH_RELEASES_REQUEST]: () => ({
    ...defaultState,
    meta: {
      loading: true,
    },
  }),
  [FETCH_RELEASES_SUCCESS]: (state, { payload }) => ({
    ...state,
    data: payload.data,
    meta: {
      loading: false,
    },
  }),
  [FETCH_RELEASES_ERROR]: (state, { payload }) => ({
    ...state,
    meta: {
      error: payload.error,
      loading: false,
    },
  }),
}, defaultState);
