import { createAction, handleActions, combineActions } from 'redux-actions';
import computeLoading from './lib/computeLoading';
const actionsPrefix = 'KUBERNAUT/SERVICE_MANAGE';
export const initServiceManage = createAction(`${actionsPrefix}/INITIALISE`);
export const updateServiceStatusForNamespace = createAction(`${actionsPrefix}/UPDATE_SERVICE_STATUS`);
export const updateServiceStatusSuccess = createAction(`${actionsPrefix}/UPDATE_SERVICE_STATUS_SUCCESS`);
export const fetchServices = createAction(`${actionsPrefix}/FETCH_SERVICES`);
export const fetchNamespacesPagination = createAction(`${actionsPrefix}/FETCH_NAMESPACES_PAGINATION`);
export const setPagination = createAction(`${actionsPrefix}/SET_PAGINATION`);
export const canManageRequest = createAction(`${actionsPrefix}/CAN_MANAGE_REQUEST`);
export const setCanManage = createAction(`${actionsPrefix}/SET_CAN_MANAGE`);
export const FETCH_SERVICE_REQUEST = createAction(`${actionsPrefix}/FETCH_SERVICE_REQUEST`);
export const FETCH_SERVICE_SUCCESS = createAction(`${actionsPrefix}/FETCH_SERVICE_SUCCESS`);
export const FETCH_SERVICE_ERROR = createAction(`${actionsPrefix}/FETCH_SERVICE_ERROR`);
export const FETCH_SERVICE_NAMESPACES_STATUS_REQUEST = createAction(`${actionsPrefix}/FETCH_SERVICE_NAMESPACES_STATUS_REQUEST`);
export const FETCH_SERVICE_NAMESPACES_STATUS_SUCCESS = createAction(`${actionsPrefix}/FETCH_SERVICE_NAMESPACES_STATUS_SUCCESS`);
export const FETCH_SERVICE_NAMESPACES_STATUS_ERROR = createAction(`${actionsPrefix}/FETCH_SERVICE_NAMESPACES_STATUS_ERROR`);

export const selectNamespaces = (state) => (state.serviceManage.namespaces);
export const selectPaginationState = (state) => (state.serviceManage.pagination);

const defaultState = {
  meta: {
    loading: {
      sections: {
        service: false,
        namespaces: false,
        canManage: false,
      },
      loadingPercent: 100,
    },
  },
  namespaces: {
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
  initialValues: {},
  id: '',
};

export default handleActions({
  [initServiceManage]: () => ({
    ...defaultState,
  }),
  [FETCH_SERVICE_REQUEST]: (state) => ({
    ...state,
    meta: {
      ...state.meta,
      loading: computeLoading(state.meta.loading, 'service', true),
    },
  }),
  [FETCH_SERVICE_SUCCESS]: (state, { payload: { data } }) => ({
    ...state,
    meta: {
      ...state.meta,
      loading: computeLoading(state.meta.loading, 'service', false),
    },
    id: data.id,
  }),
  [FETCH_SERVICE_ERROR]: (state, { payload }) => ({
    ...state,
    meta: {
      ...state.meta,
      loading: computeLoading(state.meta.loading, 'service', false),
      error: payload.error,
    },
  }),
  [FETCH_SERVICE_NAMESPACES_STATUS_REQUEST]: (state) => ({
    ...state,
    namespaces: defaultState.namespaces,
    meta: {
      ...state.meta,
      loading: computeLoading(state.meta.loading, 'namespaces', true),
    },
  }),
  [FETCH_SERVICE_NAMESPACES_STATUS_SUCCESS]: (state, { payload }) => ({
    ...state,
    namespaces: payload.data,
    initialValues: {
      namespaces: payload.data.items,
    },
    meta: {
      ...state.meta,
      loading: computeLoading(state.meta.loading, 'namespaces', false),
    },
  }),
  [FETCH_SERVICE_NAMESPACES_STATUS_ERROR]: (state, { payload }) => ({
    ...state,
    meta: {
      ...state.meta,
      loading: computeLoading(state.meta.loading, 'namespaces', false),
      error: payload.error,
    },
  }),
  [updateServiceStatusSuccess]: (state, { payload }) => ({
    ...state,
    namespaces: payload.data,
    initialValues: {
      namespaces: payload.data.items,
    },
  }),
  [combineActions(fetchNamespacesPagination, setPagination)]: (state, { payload }) => ({
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
}, defaultState);
