import { createAction, handleActions, combineActions } from 'redux-actions';
import { createFormAction } from 'redux-form-saga';
import {
  getFormValues as rfGetFormValues,
} from 'redux-form';
import {
  createFilterActions,
  createFilterSelectors,
  createDefaultFilterState,
  createFilterReducers,
} from './lib/filter';
const actionsPrefix = 'KUBERNAUT/NAMESPACES';
const filterActions = createFilterActions(actionsPrefix);
export const initialiseNamespacesPage = createAction(`${actionsPrefix}/INITIALISE`);
export const fetchNamespaces = createAction(`${actionsPrefix}/FETCH_NAMESPACES`);
export const fetchNamespacesPagination = createAction(`${actionsPrefix}/FETCH_NAMESPACES_PAGINATION`);
export const FETCH_NAMESPACES_REQUEST = createAction(`${actionsPrefix}/FETCH_NAMESPACES_REQUEST`);
export const FETCH_NAMESPACES_SUCCESS = createAction(`${actionsPrefix}/FETCH_NAMESPACES_SUCCESS`);
export const FETCH_NAMESPACES_ERROR = createAction(`${actionsPrefix}/FETCH_NAMESPACES_ERROR`);
export const setCanWrite = createAction(`${actionsPrefix}/SET_CAN_WRITE`);
export const setClusters = createAction(`${actionsPrefix}/SET_CLUSTERS`);
export const openModal = createAction(`${actionsPrefix}/OPEN_MODAL`);
export const closeModal = createAction(`${actionsPrefix}/CLOSE_MODAL`);
export const setPagination = createAction(`${actionsPrefix}/SET_PAGINATION`);

export const {
  addFilter,
  removeFilter,
  search,
  clearSearch,
  showFilters,
  hideFilters,
  setFilters,
  setSearch,
} = filterActions;

export const getFormValues = (state) => rfGetFormValues('newNamespace')(state);
export const submitForm = createFormAction(`${actionsPrefix}/SUBMIT_FORM`);
export const selectPaginationState = (state) => (state.namespaces.pagination);

export const {
  selectTableFilters,
  selectSearchFilter,
} = createFilterSelectors('namespaces.filter');

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
  canWrite: false,
  clusters: {
    limit: 0,
    offset: 0,
    count: 0,
    pages: 0,
    page: 0,
    items: [],
  },
  initialValues: {
    name: '',
    cluster: '',
  },
  pagination: {
    page: 1,
    limit: 20,
  },
  newModalOpen: false,
  filter: defaultFilterState,
};

export default handleActions({
  [initialiseNamespacesPage]: () => (defaultState),
  [FETCH_NAMESPACES_REQUEST]: (state) => ({
    ...state,
    data: {
      ...defaultState.data,
    },
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
  [setCanWrite]: (state, { payload }) => ({
    ...state,
    canWrite: payload,
  }),
  [setClusters]: (state, { payload }) => ({
    ...state,
    clusters: payload.data,
  }),
  [openModal]: (state) => ({
    ...state,
    newModalOpen: true,
  }),
  [closeModal]: (state) => ({
    ...state,
    newModalOpen: false,
  }),
  [combineActions(fetchNamespacesPagination, setPagination)]: (state, { payload }) => ({
    ...state,
    pagination: {
      page: payload.page || defaultState.pagination.page,
      limit: payload.limit || defaultState.pagination.limit,
    },
  }),
  ...createFilterReducers(filterActions, defaultFilterState),
}, defaultState);
