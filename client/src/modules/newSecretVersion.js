import { createAction, handleActions } from 'redux-actions';
import { createFormAction } from 'redux-form-saga';
import computeLoading from './lib/computeLoading';
const actionsPrefix = 'KUBERNAUT/NEW_SECRET_VERSION';
export const initNewSecretVersion = createAction(`${actionsPrefix}/INITIALISE`);
export const canManageRequest = createAction(`${actionsPrefix}/CAN_MANAGE_REQUEST`);
export const setCanManage = createAction(`${actionsPrefix}/SET_CAN_MANAGE`);
export const FETCH_VERSIONS_REQUEST = createAction(`${actionsPrefix}/FETCH_VERSIONS_REQUEST`);
export const FETCH_VERSIONS_SUCCESS = createAction(`${actionsPrefix}/FETCH_VERSIONS_SUCCESS`);
export const FETCH_VERSIONS_ERROR = createAction(`${actionsPrefix}/FETCH_VERSIONS_ERROR`);
export const FETCH_NAMESPACE_REQUEST = createAction(`${actionsPrefix}/FETCH_NAMESPACE_REQUEST`);
export const FETCH_NAMESPACE_SUCCESS = createAction(`${actionsPrefix}/FETCH_NAMESPACE_SUCCESS`);
export const FETCH_NAMESPACE_ERROR = createAction(`${actionsPrefix}/FETCH_NAMESPACE_ERROR`);
export const addSecret = createAction(`${actionsPrefix}/ADD_SECRET`);
export const removeSecret = createAction(`${actionsPrefix}/REMOVE_SECRET`);
export const saveVersion = createFormAction(`${actionsPrefix}/SAVE_VERSION`);
export const validateAnnotations = createAction(`${actionsPrefix}/VALIDATE_ANNOTATIONS`);

export const selectNamespace = (state) => (state.newSecretVersion.namespace);

const defaultState = {
  meta: {
    loading: {
      sections: {
        version: false,
        namespace: false,
        canManage: false,
      },
      loadingPercent: 100,
    },
  },
  canManage: false,
  version: {
    namespace: {
      cluster: {

      },
    },
    service: {
      registry: {

      }
    },
    secrets: [],
  },
  namespace: {
    cluster: {

    }
  },
  initialValues: {
    secrets: [],
    newSecretSection: {
      newSecretType: 'json'
    }
  },
};

export default handleActions({
  [initNewSecretVersion]: (state, { payload }) => ({
    ...defaultState,
    initialValues: {
      ...defaultState.initialValues,
      registry: payload.match.params.registry,
      service: payload.match.params.name,
    }
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
  [FETCH_VERSIONS_REQUEST]: (state) => ({
    ...state,
    meta: {
      ...state.meta,
      loading: computeLoading(state.meta.loading, 'versions', true),
    },
  }),
  [FETCH_VERSIONS_SUCCESS]: (state, { payload: { latestVersion } }) => ({
    ...state,
    meta: {
      ...state.meta,
      loading: computeLoading(state.meta.loading, 'versions', false),
    },
    versions: latestVersion || defaultState.version,
    initialValues: latestVersion ? {
      ...state.initialValues,
      secrets: latestVersion.secrets,
    } : state.initialValues,
  }),
  [FETCH_VERSIONS_ERROR]: (state, { payload }) => ({
    ...state,
    meta: {
      ...state.meta,
      loading: computeLoading(state.meta.loading, 'versions', false),
      error: payload.error,
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
