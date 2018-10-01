import { createAction, handleActions } from 'redux-actions';
import {
  createFilterActions,
  createFilterSelectors,
  createDefaultFilterState,
  createFilterReducers,
} from './lib/filter';
const actionsPrefix = 'KUBERNAUT/DEPLOYMENTS';
const filterActions = createFilterActions(actionsPrefix);
export const fetchDeploymentsPagination = createAction(`${actionsPrefix}/FETCH_DEPLOYMENTS_PAGINATION`);
export const toggleSort = createAction(`${actionsPrefix}/TOGGLE_SERVICES_SORT`);
export const initialise = createAction(`${actionsPrefix}/INITIALISE`);
export const FETCH_DEPLOYMENTS_REQUEST = createAction(`${actionsPrefix}/FETCH_DEPLOYMENTS_REQUEST`);
export const FETCH_DEPLOYMENTS_SUCCESS = createAction(`${actionsPrefix}/FETCH_DEPLOYMENTS_SUCCESS`);
export const FETCH_DEPLOYMENTS_ERROR = createAction(`${actionsPrefix}/FETCH_DEPLOYMENTS_ERROR`);
export const {
  addFilter,
  removeFilter,
  search,
  clearSearch,
  showFilters,
  hideFilters,
} = filterActions;

export const selectSortState = (state) => (state.deployments.sort);
export const {
  selectTableFilters
} = createFilterSelectors('deployments.filter');

const defaultFilterState = createDefaultFilterState({
  defaultColumn: 'service',
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
    column: 'created',
    order: 'desc',
  },
  filter: defaultFilterState,
};

export default handleActions({
  [initialise]: () => ({
    ...defaultState,
  }),
  [FETCH_DEPLOYMENTS_REQUEST]: (state) => ({
    ...state,
    data: {
      ...defaultState.data,
    },
    meta: {
      loading: true,
    },
  }),
  [FETCH_DEPLOYMENTS_SUCCESS]: (state, { payload }) => ({
    ...state,
    data: payload.data,
    meta: {
      loading: false,
    },
  }),
  [FETCH_DEPLOYMENTS_ERROR]: (state, { payload }) => ({
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
