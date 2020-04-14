import { createAction, handleActions } from 'redux-actions';

const actionsPrefix = 'KUBERNAUT/JOBS';
export const fetchJobsPagination = createAction(`${actionsPrefix}/FETCH_JOBS_PAGINATION`);
export const FETCH_JOBS_REQUEST = createAction(`${actionsPrefix}/FETCH_JOBS_REQUEST`);
export const FETCH_JOBS_SUCCESS = createAction(`${actionsPrefix}/FETCH_JOBS_SUCCESS`);
export const FETCH_JOBS_ERROR = createAction(`${actionsPrefix}/FETCH_JOBS_ERROR`);

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
  [FETCH_JOBS_REQUEST]: () => ({
    ...defaultState,
    meta: {
      loading: true,
    },
  }),
  [FETCH_JOBS_SUCCESS]: (state, { payload }) => ({
    ...state,
    data: payload.data,
    meta: {
      loading: false,
    },
  }),
  [FETCH_JOBS_ERROR]: (state, { payload }) => ({
    ...state,
    meta: {
      error: payload.error,
      loading: false,
    },
  }),
}, defaultState);
