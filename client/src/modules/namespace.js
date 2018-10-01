import { createAction, handleActions } from 'redux-actions';
const actionsPrefix = 'KUBERNAUT/NAMESPACE';
export const fetchNamespacePageData = createAction(`${actionsPrefix}/FETCH_NAMESPACE_PAGE_DATA`);
export const fetchDeploymentsPagination = createAction(`${actionsPrefix}/FETCH_DEPLOYMENTS_PAGINATION`);

export const FETCH_NAMESPACE_REQUEST = createAction(`${actionsPrefix}/FETCH_NAMESPACE_REQUEST`);
export const FETCH_NAMESPACE_SUCCESS = createAction(`${actionsPrefix}/FETCH_NAMESPACE_SUCCESS`);
export const FETCH_NAMESPACE_ERROR = createAction(`${actionsPrefix}/FETCH_NAMESPACE_ERROR`);

export const FETCH_DEPLOYMENTS_REQUEST = createAction(`${actionsPrefix}/FETCH_DEPLOYMENTS_REQUEST`);
export const FETCH_DEPLOYMENTS_SUCCESS = createAction(`${actionsPrefix}/FETCH_DEPLOYMENTS_SUCCESS`);
export const FETCH_DEPLOYMENTS_ERROR = createAction(`${actionsPrefix}/FETCH_DEPLOYMENTS_ERROR`);

export const toggleSort = createAction(`${actionsPrefix}/TOGGLE_SERVICES_SORT`);

export const selectNamespace = (state) => (state.namespace.namespace.data);
export const selectSortState = (state) => (state.namespace.deployments.sort);

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
}, defaultState);
