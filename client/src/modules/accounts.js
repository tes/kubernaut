import { createAction, handleActions } from 'redux-actions';
const actionsPrefix = `KUBERNAUT/ACCOUNTS`;
export const fetchAccountsPagination = createAction(`${actionsPrefix}/FETCH_ACCOUNTS_PAGINATION`);
export const FETCH_ACCOUNTS_REQUEST = createAction(`${actionsPrefix}/FETCH_ACCOUNTS_REQUEST`);
export const FETCH_ACCOUNTS_SUCCESS = createAction(`${actionsPrefix}/FETCH_ACCOUNTS_SUCCESS`);
export const FETCH_ACCOUNTS_ERROR = createAction(`${actionsPrefix}/FETCH_ACCOUNTS_ERROR`);

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
