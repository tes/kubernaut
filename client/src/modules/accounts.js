import { createAction, handleActions } from 'redux-actions';
import {
  createFilterActions,
  createFilterSelectors,
  createDefaultFilterState,
  createFilterReducers,
} from './lib/filter';
const actionsPrefix = `KUBERNAUT/ACCOUNTS`;
const filterActions = createFilterActions(actionsPrefix);
export const fetchAccountsPagination = createAction(`${actionsPrefix}/FETCH_ACCOUNTS_PAGINATION`);
export const toggleSort = createAction(`${actionsPrefix}/TOGGLE_SERVICES_SORT`);
export const initialise = createAction(`${actionsPrefix}/INITIALISE`);
export const FETCH_ACCOUNTS_REQUEST = createAction(`${actionsPrefix}/FETCH_ACCOUNTS_REQUEST`);
export const FETCH_ACCOUNTS_SUCCESS = createAction(`${actionsPrefix}/FETCH_ACCOUNTS_SUCCESS`);
export const FETCH_ACCOUNTS_ERROR = createAction(`${actionsPrefix}/FETCH_ACCOUNTS_ERROR`);
export const {
  addFilter,
  removeFilter,
  search,
  clearSearch,
  showFilters,
  hideFilters,
} = filterActions;

export const selectSortState = (state) => (state.accounts.sort);
export const {
  selectTableFilters
} = createFilterSelectors('accounts.filter');

const defaultFilterState = createDefaultFilterState({
  defaultColumn: 'name',
});

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
  filter: defaultFilterState,
};

export default handleActions({
  [initialise]: () => ({
    ...defaultState,
  }),
  [FETCH_ACCOUNTS_REQUEST]: (state) => ({
    ...state,
    data: {
      ...defaultState.data,
    },
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
  [toggleSort]: (state, { payload }) => ({
    ...state,
    sort: {
      column: payload,
      order: state.sort.column === payload ? (state.sort.order === 'asc' ? 'desc' : 'asc') : 'asc',
    },
  }),
  ...createFilterReducers(filterActions, defaultFilterState),
}, defaultState);
