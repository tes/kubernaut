import { createAction, handleActions, combineActions } from 'redux-actions';
import computeLoading from './lib/computeLoading';
const actionsPrefix = 'KUBERNAUT/SECRET_OVERVIEW';
export const initSecretOverview = createAction(`${actionsPrefix}/INITIALISE`);
export const fetchVersionsPagination = createAction(`${actionsPrefix}/FETCH_VERSIONS_PAGINATION`);
export const setPagination = createAction(`${actionsPrefix}/SET_PAGINATION`);
export const canManageRequest = createAction(`${actionsPrefix}/CAN_MANAGE_REQUEST`);
export const setCanManage = createAction(`${actionsPrefix}/SET_CAN_MANAGE`);
export const FETCH_NAMESPACE_REQUEST = createAction(`${actionsPrefix}/FETCH_NAMESPACE_REQUEST`);
export const FETCH_NAMESPACE_SUCCESS = createAction(`${actionsPrefix}/FETCH_NAMESPACE_SUCCESS`);
export const FETCH_NAMESPACE_ERROR = createAction(`${actionsPrefix}/FETCH_NAMESPACE_ERROR`);

export const selectNamespace = (state) => (state.secretOverview.namespace);
export const selectPaginationState = (state) => (state.secretOverview.pagination);

const defaultState = {
  meta: {
    loading: {
      sections: {
        versions: false,
        namespace: false,
        canManage: false,
      },
      loadingPercent: 100,
    },
  },
  versions: {
    count: 0,
    limit: 0,
    pages: 0,
    page: 0,
    items: [],
  },
  pagination: {
    page: 1,
    limit: 10,
  },
  canManage: false,
  namespace: {
    cluster: {

    },
  },
};

export default handleActions({
  [initSecretOverview]: () => ({
    ...defaultState,
  }),
  [combineActions(fetchVersionsPagination, setPagination)]: (state, { payload }) => ({
    ...state,
    pagination: {
      page: payload.page || defaultState.pagination.page,
      limit: payload.limit || defaultState.pagination.limit,
    },
  }),
  [canManageRequest]: (state) => ({
    ...state,
    meta: {
      ...state.meta,
      loading: computeLoading(state.meta.loading, 'canManage', true),
    }
  }),
  [setCanManage]: (state, { payload }) => ({
    ...state,
    canManage: payload,
    meta: {
      ...state.meta,
      loading: computeLoading(state.meta.loading, 'canManage', false),
    },
  }),
  [FETCH_NAMESPACE_REQUEST]: (state) => ({
    ...state,
    meta: {
      ...state.meta,
      loading: computeLoading(state.meta.loading, 'namespace', true),
    },
  }),
  [FETCH_NAMESPACE_SUCCESS]: (state, { payload: { data } }) => ({
    ...state,
    meta: {
      ...state.meta,
      loading: computeLoading(state.meta.loading, 'namespace', false),
    },
    namespace: data,
  }),
  [FETCH_NAMESPACE_ERROR]: (state, { payload }) => ({
    ...state,
    meta: {
      ...state.meta,
      loading: computeLoading(state.meta.loading, 'namespace', false),
      error: payload.error,
    },
  }),
}, defaultState);
