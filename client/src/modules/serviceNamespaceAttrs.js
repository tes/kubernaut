import { createAction, handleActions } from 'redux-actions';
import { createFormAction } from 'redux-form-saga';
import {
  getFormValues as rfGetFormValues,
} from 'redux-form';
import computeLoading from './lib/computeLoading';

const actionsPrefix = 'KUBERNAUT/SERVICE_NAMESPACE_ATTRS';
export const initForm = createAction(`${actionsPrefix}/INIT_FORM`);

export const FETCH_NAMESPACE_REQUEST = createAction(`${actionsPrefix}/FETCH_NAMESPACE_REQUEST`);
export const FETCH_NAMESPACE_SUCCESS = createAction(`${actionsPrefix}/FETCH_NAMESPACE_SUCCESS`);
export const FETCH_NAMESPACE_ERROR = createAction(`${actionsPrefix}/FETCH_NAMESPACE_ERROR`);

export const FETCH_ATTRIBUTES_REQUEST = createAction(`${actionsPrefix}/FETCH_ATTRIBUTES_REQUEST`);
export const FETCH_ATTRIBUTES_SUCCESS = createAction(`${actionsPrefix}/FETCH_ATTRIBUTES_SUCCESS`);
export const FETCH_ATTRIBUTES_ERROR = createAction(`${actionsPrefix}/FETCH_ATTRIBUTES_ERROR`);

export const submitForm = createFormAction(`${actionsPrefix}/SUBMIT_FORM`);
export const canManageRequest = createAction(`${actionsPrefix}/CAN_MANAGE_REQUEST`);
export const setCanManage = createAction(`${actionsPrefix}/SET_CAN_MANAGE`);

export const selectNamespace = (state) => (state.serviceNamespaceAttrs.namespace);
export const getFormValues = (state) => rfGetFormValues('serviceNamespaceAttrs')(state);

const defaultState = {
  canManage: false,
  meta: {
    loading: {
      sections: {
        attributes: false,
        namespace: false,
        canManage: false,
      },
      loadingPercent: 100,
    },
  },
  namespace: {
    cluster: {

    },
  },
  initialValues: {
    attributes: []
  },
};

export default handleActions({
  [initForm]: (state, { payload }) => ({
    ...defaultState,
    initialValues: {
      ...defaultState.initialValues,
      registry: payload.match.params.registry,
      service: payload.match.params.name,
    }
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
  [FETCH_ATTRIBUTES_REQUEST]: (state) => ({
    ...state,
    meta: {
      ...state.meta,
      loading: computeLoading(state.meta.loading, 'attributes', true),
    },
  }),
  [FETCH_ATTRIBUTES_SUCCESS]: (state, { payload: { data } }) => ({
    ...state,
    meta: {
      ...state.meta,
      loading: computeLoading(state.meta.loading, 'attributes', false),
    },
    initialValues: {
      ...state.initialValues,
      attributes: Object.keys(data).reduce((arr, attr) => {
      return arr.concat({ name: attr, value: data[attr], tempKey: Math.random() });
    }, [])
  },
  }),
  [FETCH_ATTRIBUTES_ERROR]: (state, { payload }) => ({
    ...state,
    meta: {
      ...state.meta,
      loading: computeLoading(state.meta.loading, 'attributes', false),
      error: payload.error,
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
