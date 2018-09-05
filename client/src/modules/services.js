import { createAction, handleActions } from 'redux-actions';
const actionsPrefix = 'KUBERNAUT/SERVICES';
export const fetchServicesPagination = createAction(`${actionsPrefix}/FETCH_SERVICES_PAGINATION`);
export const toggleSort = createAction(`${actionsPrefix}/TOGGLE_SERVICES_SORT`);
export const initialise = createAction(`${actionsPrefix}/INITIALISE`);
export const FETCH_SERVICES_REQUEST = createAction(`${actionsPrefix}/FETCH_SERVICES_REQUEST`);
export const FETCH_SERVICES_SUCCESS = createAction(`${actionsPrefix}/FETCH_SERVICES_SUCCESS`);
export const FETCH_SERVICES_ERROR = createAction(`${actionsPrefix}/FETCH_SERVICES_ERROR`);

export const selectSortState = (state) => (state.services.sort);

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
  sort: {
    column: 'name',
    order: 'asc',
  },
};

export default handleActions({
  [initialise]: () => ({
    ...defaultState,
  }),
  [FETCH_SERVICES_REQUEST]: (state) => ({
    ...state,
    data: {
      ...defaultState.data,
    },
    meta: {
      loading: true,
    },
  }),
  [FETCH_SERVICES_SUCCESS]: (state, { payload }) => ({
    ...state,
    data: payload.data,
    meta: {
      loading: false,
    },
  }),
  [FETCH_SERVICES_ERROR]: (state, { payload }) => ({
    ...state,
    meta: {
      error: payload.error,
      loading: false,
    },
  }),
  [toggleSort]: (state, { payload }) => ({
    ...state,
    sort: {
      column: payload,
      order: state.sort.column === payload ? (state.sort.order === 'asc' ? 'desc' : 'asc') : 'asc',
    },
  }),
}, defaultState);
