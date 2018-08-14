import { createAction, handleActions } from 'redux-actions';
import computeLoading from './lib/computeLoading';

const actionsPrefix = 'KUBERNAUT/NAMESPACE_MANAGE';
export const initialise = createAction(`${actionsPrefix}/INITIALISE`);
export const updateServiceStatusForNamespace = createAction(`${actionsPrefix}/UPDATE_SERVICE_STATUS`);
export const updateServiceStatusSuccess = createAction(`${actionsPrefix}/UPDATE_SERVICE_STATUS_SUCCESS`);
export const fetchServicesPagination = createAction(`${actionsPrefix}/FETCH_SERVICES_PAGINATION`);
export const FETCH_NAMESPACE_REQUEST = createAction(`${actionsPrefix}/FETCH_NAMESPACE_REQUEST`);
export const FETCH_NAMESPACE_SUCCESS = createAction(`${actionsPrefix}/FETCH_NAMESPACE_SUCCESS`);
export const FETCH_NAMESPACE_ERROR = createAction(`${actionsPrefix}/FETCH_NAMESPACE_ERROR`);
export const FETCH_SERVICES_NAMESPACE_STATUS_REQUEST = createAction(`${actionsPrefix}/FETCH_SERVICES_NAMESPACE_STATUS_REQUEST`);
export const FETCH_SERVICES_NAMESPACE_STATUS_SUCCESS = createAction(`${actionsPrefix}/FETCH_SERVICES_NAMESPACE_STATUS_SUCCESS`);
export const FETCH_SERVICES_NAMESPACE_STATUS_ERROR = createAction(`${actionsPrefix}/FETCH_SERVICES_NAMESPACE_STATUS_ERROR`);

export const selectServices = (state) => (state.namespaceManage.services);

const defaultState = {
  id: '',
  name: '',
  color: '',
  cluster: '',
  meta: {
    loading: {
      sections: {
        namespace: false,
        services: false,
      },
      loadingPercent: 100,
    },
  },
  services: {
    count: 0,
    items: [],
  },
  initialValues: {},
};

export default handleActions({
  [initialise]: () => ({
    ...defaultState,
  }),
  [FETCH_NAMESPACE_REQUEST]: (state) => ({
    ...state,
    meta: {
      loading: computeLoading(state.meta.loading, 'namespace', true),
    },
  }),
  [FETCH_NAMESPACE_SUCCESS]: (state, { payload: { data } }) => ({
    ...state,
    meta: {
      loading: computeLoading(state.meta.loading, 'namespace', false),
    },
    id: data.id,
    name: data.name,
    cluster: data.cluster.name,
    color: data.color || data.cluster.color,
  }),
  [FETCH_NAMESPACE_ERROR]: (state, { payload }) => ({
    ...state,
    meta: {
      loading: computeLoading(state.meta.loading, 'namespace', false),
      error: payload.error,
    },
  }),
  [FETCH_SERVICES_NAMESPACE_STATUS_REQUEST]: (state) => ({
    ...state,
    services: defaultState.services,
    meta: {
      loading: computeLoading(state.meta.loading, 'services', true),
    },
  }),
  [FETCH_SERVICES_NAMESPACE_STATUS_SUCCESS]: (state, { payload }) => ({
    ...state,
    services: payload.data,
    initialValues: {
      services: payload.data.items,
    },
    meta: {
      loading: computeLoading(state.meta.loading, 'services', false),
    },
  }),
  [FETCH_SERVICES_NAMESPACE_STATUS_ERROR]: (state, { payload }) => ({
    ...state,
    meta: {
      loading: computeLoading(state.meta.loading, 'services', false),
      error: payload.error,
    },
  }),
  [updateServiceStatusSuccess]: (state, { payload }) => ({
    ...state,
    services: payload.data,
    initialValues: {
      services: payload.data.items,
    },
  }),
}, defaultState);
