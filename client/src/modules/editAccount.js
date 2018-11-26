import { createAction, handleActions } from 'redux-actions';
import computeLoading from './lib/computeLoading';

const actionsPrefix = `KUBERNAUT/EDIT_ACCOUNT`;
export const fetchAccountInfo = createAction(`${actionsPrefix}/FETCH_ACCOUNT_INFO`);
export const updateRolesForNamespace = createAction(`${actionsPrefix}/UPDATE_ROLES_FOR_NAMESPACE`);
export const addNewNamespace = createAction(`${actionsPrefix}/ADD_NEW_NAMESPACE`);
export const deleteRolesForRegistry = createAction(`${actionsPrefix}/DELETE_ROLES_FOR_REGISTRY`);
export const updateRolesForRegistry = createAction(`${actionsPrefix}/UPDATE_ROLES_FOR_REGISTRY`);
export const addNewRegistry = createAction(`${actionsPrefix}/ADD_NEW_REGISTRY`);
export const deleteRolesForNamespace = createAction(`${actionsPrefix}/DELETE_ROLES_FOR_NAMESPACE`);
export const FETCH_ACCOUNT_REQUEST = createAction(`${actionsPrefix}/FETCH_ACCOUNT_REQUEST`);
export const FETCH_ACCOUNT_SUCCESS = createAction(`${actionsPrefix}/FETCH_ACCOUNT_SUCCESS`);
export const FETCH_ACCOUNT_ERROR = createAction(`${actionsPrefix}/FETCH_ACCOUNT_ERROR`);
export const FETCH_NAMESPACES_REQUEST = createAction(`${actionsPrefix}/FETCH_NAMESPACES_REQUEST`);
export const FETCH_NAMESPACES_SUCCESS = createAction(`${actionsPrefix}/FETCH_NAMESPACES_SUCCESS`);
export const FETCH_NAMESPACES_ERROR = createAction(`${actionsPrefix}/FETCH_NAMESPACES_ERROR`);
export const FETCH_REGISTRIES_REQUEST = createAction(`${actionsPrefix}/FETCH_REGISTRIES_REQUEST`);
export const FETCH_REGISTRIES_SUCCESS = createAction(`${actionsPrefix}/FETCH_REGISTRIES_SUCCESS`);
export const FETCH_REGISTRIES_ERROR = createAction(`${actionsPrefix}/FETCH_REGISTRIES_ERROR`);
export const UPDATE_ROLE_FOR_NAMESPACE_SUCCESS = createAction(`${actionsPrefix}/UPDATE_ROLE_FOR_NAMESPACE_SUCCESS`);
export const UPDATE_ROLE_FOR_REGISTRY_SUCCESS = createAction(`${actionsPrefix}/UPDATE_ROLE_FOR_REGISTRY_SUCCESS`);
export const setCanEdit = createAction(`${actionsPrefix}/SET_CAN_EDIT`);

export const selectAccount = (state) => (state.editAccount.account);

const defaultState = {
  account: {},
  canEdit: false,
  meta: {
    loading: {
      sections: {
        account: false,
        namespaces: false,
        registries: false,
      },
      loadingPercent: 100,
    },
  },
  namespaces: {
    count: 0,
    items: [],
  },
  registries: {
    count: 0,
    items: [],
  }
};

export default handleActions({
  [FETCH_ACCOUNT_REQUEST]: (state) => ({
    ...state,
    account: defaultState.account,
    meta: {
      loading: computeLoading(state.meta.loading, 'account', true),
    },
  }),
  [FETCH_ACCOUNT_SUCCESS]: (state, { payload }) => ({
    ...state,
    account: payload.data,
    meta: {
      loading: computeLoading(state.meta.loading, 'account', false),
    },
  }),
  [FETCH_ACCOUNT_ERROR]: (state, { payload }) => ({
    ...state,
    meta: {
      loading: computeLoading(state.meta.loading, 'account', false),
      error: payload.error,
    },
  }),
  [FETCH_NAMESPACES_REQUEST]: (state) => ({
    ...state,
    namespaces: defaultState.namespaces,
    meta: {
      loading: computeLoading(state.meta.loading, 'namespaces', true),
    },
  }),
  [FETCH_NAMESPACES_SUCCESS]: (state, { payload }) => ({
    ...state,
    namespaces: payload.data,
    meta: {
      loading: computeLoading(state.meta.loading, 'namespaces', false),
    },
  }),
  [FETCH_NAMESPACES_ERROR]: (state, { payload }) => ({
    ...state,
    meta: {
      loading: computeLoading(state.meta.loading, 'namespaces', false),
      error: payload.error,
    },
  }),
  [FETCH_REGISTRIES_REQUEST]: (state) => ({
    ...state,
    registries: defaultState.registries,
    meta: {
      loading: computeLoading(state.meta.loading, 'registries', true),
    },
  }),
  [FETCH_REGISTRIES_SUCCESS]: (state, { payload }) => ({
    ...state,
    registries: payload.data,
    meta: {
      loading: computeLoading(state.meta.loading, 'registries', false),
    },
  }),
  [FETCH_REGISTRIES_ERROR]: (state, { payload }) => ({
    ...state,
    meta: {
      loading: computeLoading(state.meta.loading, 'registries', false),
      error: payload.error,
    },
  }),
  [UPDATE_ROLE_FOR_NAMESPACE_SUCCESS]: (state, { payload }) => ({
    ...state,
    account: payload.data,
  }),
  [UPDATE_ROLE_FOR_REGISTRY_SUCCESS]: (state, { payload }) => ({
    ...state,
    account: payload.data,
  }),
  [setCanEdit]: (state, { payload }) => ({
    ...state,
    canEdit: payload,
  }),
}, defaultState);
