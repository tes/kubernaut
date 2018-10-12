import { createAction, handleActions, combineActions } from 'redux-actions';
import { createMatchSelector } from 'connected-react-router';
import paths from '../paths';

const actionsPrefix = 'KUBERNAUT/NAMESPACE';
export const fetchNamespacePageData = createAction(`${actionsPrefix}/FETCH_NAMESPACE_PAGE_DATA`);
export const fetchDeployments = createAction(`${actionsPrefix}/FETCH_DEPLOYMENTS`);
export const fetchDeploymentsPagination = createAction(`${actionsPrefix}/FETCH_DEPLOYMENTS_PAGINATION`);

export const FETCH_NAMESPACE_REQUEST = createAction(`${actionsPrefix}/FETCH_NAMESPACE_REQUEST`);
export const FETCH_NAMESPACE_SUCCESS = createAction(`${actionsPrefix}/FETCH_NAMESPACE_SUCCESS`);
export const FETCH_NAMESPACE_ERROR = createAction(`${actionsPrefix}/FETCH_NAMESPACE_ERROR`);

export const FETCH_DEPLOYMENTS_REQUEST = createAction(`${actionsPrefix}/FETCH_DEPLOYMENTS_REQUEST`);
export const FETCH_DEPLOYMENTS_SUCCESS = createAction(`${actionsPrefix}/FETCH_DEPLOYMENTS_SUCCESS`);
export const FETCH_DEPLOYMENTS_ERROR = createAction(`${actionsPrefix}/FETCH_DEPLOYMENTS_ERROR`);

export const toggleSort = createAction(`${actionsPrefix}/TOGGLE_SORT`);
export const setPagination = createAction(`${actionsPrefix}/SET_PAGINATION`);
export const setSort = createAction(`${actionsPrefix}/SET_SORT`);

export const selectNamespace = (state) => (state.namespace.namespace.data);
export const selectSortState = (state) => (state.namespace.deployments.sort);
export const selectPaginationState = (state) => (state.namespace.deployments.pagination);
export const selectUrlMatch = createMatchSelector(paths.namespace);

const defaultState = {
  namespace: {
    meta: {},
    data: {
      cluster: {},
      attributes: {},
    },
  },
  deployments: {
    meta: {},
    data: {
      limit: 0,
      offset: 0,
      count: 0,
      pages: 0,
      page: 0,
      items: [],
    },
    sort: {
      column: 'created',
      order: 'desc',
    },
    pagination: {
      page: 1,
      limit: 20,
    },
  },
};

export default handleActions({
  [fetchNamespacePageData]: () => ({
    ...defaultState,
  }),
  [FETCH_NAMESPACE_REQUEST]: (state) => ({
    ...state,
    namespace: {
      ...state.namespace,
      meta: {
        loading: true
      },
    },
  }),
  [FETCH_NAMESPACE_SUCCESS]: (state, { payload }) => ({
    ...state,
    namespace: {
      ...state.namespace,
      meta: {
        loading: false,
      },
      data: payload.data,
    },
  }),
  [FETCH_NAMESPACE_ERROR]: (state, { payload }) => ({
    ...state,
    namespace: {
      ...state.namespace,
      meta: {
        loading: false,
        error: payload.error,
      },
    },
  }),
  [FETCH_DEPLOYMENTS_REQUEST]: (state) => ({
    ...state,
    deployments: {
      ...state.deployments,
      meta: {
        loading: true
      },
    },
  }),
  [FETCH_DEPLOYMENTS_SUCCESS]: (state, { payload }) => ({
    ...state,
    deployments: {
      ...state.deployments,
      meta: {
        loading: false,
      },
      data: payload.data,
    },
  }),
  [FETCH_DEPLOYMENTS_ERROR]: (state, { payload }) => ({
    ...state,
    deployments: {
      ...state.deployments,
      meta: {
        loading: false,
        error: payload.error,
      },
    },
  }),
  [toggleSort]: (state, { payload }) => ({
    ...state,
    deployments: {
      ...state.deployments,
      sort: {
        column: payload,
        order: state.deployments.sort.column === payload ? (state.deployments.sort.order === 'asc' ? 'desc' : 'asc') : 'asc',
      },
    }
  }),
  [setSort]: (state, { payload = {} }) => ({
    ...state,
    deployments: {
      ...state.deployments,
      sort: {
        column: payload.column || defaultState.deployments.sort.column,
        order: payload.order || defaultState.deployments.sort.order,
      },
    }
  }),
  [combineActions(fetchDeploymentsPagination, setPagination)]: (state, { payload }) => ({
    ...state,
    deployments: {
      ...state.deployments,
      pagination: {
        page: payload.page || defaultState.deployments.pagination.page,
        limit: payload.limit || defaultState.deployments.pagination.limit,
      },
    },
  }),
}, defaultState);
