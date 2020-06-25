import { createAction, handleActions } from 'redux-actions';
import { createFormAction } from 'redux-form-saga';
import computeLoading from './lib/computeLoading';

const actionsPrefix = 'KUBERNAUT/CLUSTER_EDIT';
export const initClusterEditPage = createAction(`${actionsPrefix}/INIT_FORM`);
export const submitForm = createFormAction(`${actionsPrefix}/SUBMIT_FORM`);
export const submitNewHostForm = createFormAction(`${actionsPrefix}/SUBMIT_NEW_HOST_FORM`);
export const submitNewVariableForm = createFormAction(`${actionsPrefix}/SUBMIT_NEW_VARIABLE_FORM`);
export const submitNewClassForm = createFormAction(`${actionsPrefix}/SUBMIT_NEW_CLASS_FORM`);
export const updateHostsForm = createFormAction(`${actionsPrefix}/SUBMIT_UPDATE_HOSTS_FORM`);
export const updateVariablesForm = createFormAction(`${actionsPrefix}/SUBMIT_UPDATE_VARIABLES_FORM`);
export const FETCH_CLUSTER_REQUEST = createAction(`${actionsPrefix}/FETCH_CLUSTER_REQUEST`);
export const FETCH_CLUSTER_SUCCESS = createAction(`${actionsPrefix}/FETCH_CLUSTER_SUCCESS`);
export const FETCH_CLUSTER_ERROR = createAction(`${actionsPrefix}/FETCH_CLUSTER_ERROR`);
export const FETCH_INGRESS_HOSTS_REQUEST = createAction(`${actionsPrefix}/FETCH_INGRESS_HOSTS_REQUEST`);
export const FETCH_INGRESS_HOSTS_SUCCESS = createAction(`${actionsPrefix}/FETCH_INGRESS_HOSTS_SUCCESS`);
export const FETCH_INGRESS_HOSTS_ERROR = createAction(`${actionsPrefix}/FETCH_INGRESS_HOSTS_ERROR`);
export const FETCH_INGRESS_VARIABLES_REQUEST = createAction(`${actionsPrefix}/FETCH_INGRESS_VARIABLES_REQUEST`);
export const FETCH_INGRESS_VARIABLES_SUCCESS = createAction(`${actionsPrefix}/FETCH_INGRESS_VARIABLES_SUCCESS`);
export const FETCH_INGRESS_VARIABLES_ERROR = createAction(`${actionsPrefix}/FETCH_INGRESS_VARIABLES_ERROR`);
export const FETCH_INGRESS_CLASSES_REQUEST = createAction(`${actionsPrefix}/FETCH_INGRESS_CLASSES_REQUEST`);
export const FETCH_INGRESS_CLASSES_SUCCESS = createAction(`${actionsPrefix}/FETCH_INGRESS_CLASSES_SUCCESS`);
export const FETCH_INGRESS_CLASSES_ERROR = createAction(`${actionsPrefix}/FETCH_INGRESS_CLASSES_ERROR`);
export const FETCH_CLUSTER_INGRESS_HOSTS_REQUEST = createAction(`${actionsPrefix}/FETCH_CLUSTER_INGRESS_HOSTS_REQUEST`);
export const FETCH_CLUSTER_INGRESS_HOSTS_SUCCESS = createAction(`${actionsPrefix}/FETCH_CLUSTER_INGRESS_HOSTS_SUCCESS`);
export const FETCH_CLUSTER_INGRESS_HOSTS_ERROR = createAction(`${actionsPrefix}/FETCH_CLUSTER_INGRESS_HOSTS_ERROR`);
export const FETCH_CLUSTER_INGRESS_VARIABLES_REQUEST = createAction(`${actionsPrefix}/FETCH_CLUSTER_INGRESS_VARIABLES_REQUEST`);
export const FETCH_CLUSTER_INGRESS_VARIABLES_SUCCESS = createAction(`${actionsPrefix}/FETCH_CLUSTER_INGRESS_VARIABLES_SUCCESS`);
export const FETCH_CLUSTER_INGRESS_VARIABLES_ERROR = createAction(`${actionsPrefix}/FETCH_CLUSTER_INGRESS_VARIABLES_ERROR`);
export const FETCH_CLUSTER_INGRESS_CLASSES_REQUEST = createAction(`${actionsPrefix}/FETCH_CLUSTER_INGRESS_CLASSES_REQUEST`);
export const FETCH_CLUSTER_INGRESS_CLASSES_SUCCESS = createAction(`${actionsPrefix}/FETCH_CLUSTER_INGRESS_CLASSES_SUCCESS`);
export const FETCH_CLUSTER_INGRESS_CLASSES_ERROR = createAction(`${actionsPrefix}/FETCH_CLUSTER_INGRESS_CLASSES_ERROR`);

export const selectCluster = (state) => state.clusterEdit.cluster;

const defaultState = {
  cluster: {
    name: '',
    config: '',
    context: '',
    color: '',
    priority: '',
  },
  meta: {
    loading: {
      sections: {
        cluster: false,
        ingressHosts: false,
        ingressVariables: false,
        ingressClasses: false,
        clusterIngressHosts: false,
        clusterIngressVariables: false,
        clusterIngressClasses: false,
      },
      loadingPercent: 100,
    }
  },
  ingressHosts: {
    items: [],
  },
  ingressVariables: {
    items: [],
  },
  ingressClasses: {
    items: [],
  },
  initialValues: {
    cluster: {},
    clusterIngressHosts: {
      hosts: [],
    },
    clusterIngressVariables: {
      variables: [],
    },
    clusterIngressClasses: {
      classes: [],
    },
  },
};

export default handleActions({
  [initClusterEditPage]: () => ({
    ...defaultState,
  }),
  [FETCH_CLUSTER_REQUEST]: (state) => ({
    ...state,
    meta: {
      ...state.meta,
      loading: computeLoading(state.meta.loading, 'cluster', true),
    },
  }),
  [FETCH_CLUSTER_SUCCESS]: (state, { payload: { data } }) => ({
    ...state,
    meta: {
      ...state.meta,
      loading: computeLoading(state.meta.loading, 'cluster', false),
    },
    cluster: data,
    initialValues: {
      ...state.initialValues,
      cluster: data,
    },
  }),
  [FETCH_CLUSTER_ERROR]: (state, { payload }) => ({
    ...state,
    meta: {
      loading: computeLoading(state.meta.loading, 'cluster', false),
      error: payload.error,
    },
  }),
  [FETCH_INGRESS_HOSTS_REQUEST]: (state) => ({
    ...state,
    meta: {
      ...state.meta,
      loading: computeLoading(state.meta.loading, 'ingressHosts', true),
    },
  }),
  [FETCH_INGRESS_HOSTS_SUCCESS]: (state, { payload: { data } }) => ({
    ...state,
    meta: {
      ...state.meta,
      loading: computeLoading(state.meta.loading, 'ingressHosts', false),
    },
    ingressHosts: data,
  }),
  [FETCH_INGRESS_HOSTS_ERROR]: (state, { payload }) => ({
    ...state,
    meta: {
      loading: computeLoading(state.meta.loading, 'ingressHosts', false),
      error: payload.error,
    },
  }),
  [FETCH_INGRESS_VARIABLES_REQUEST]: (state) => ({
    ...state,
    meta: {
      ...state.meta,
      loading: computeLoading(state.meta.loading, 'ingressVariables', true),
    },
  }),
  [FETCH_INGRESS_VARIABLES_SUCCESS]: (state, { payload: { data } }) => ({
    ...state,
    meta: {
      ...state.meta,
      loading: computeLoading(state.meta.loading, 'ingressVariables', false),
    },
    ingressVariables: data,
  }),
  [FETCH_INGRESS_VARIABLES_ERROR]: (state, { payload }) => ({
    ...state,
    meta: {
      loading: computeLoading(state.meta.loading, 'ingressVariables', false),
      error: payload.error,
    },
  }),
  [FETCH_INGRESS_CLASSES_REQUEST]: (state) => ({
    ...state,
    meta: {
      ...state.meta,
      loading: computeLoading(state.meta.loading, 'ingressClasses', true),
    },
  }),
  [FETCH_INGRESS_CLASSES_SUCCESS]: (state, { payload: { data } }) => ({
    ...state,
    meta: {
      ...state.meta,
      loading: computeLoading(state.meta.loading, 'ingressClasses', false),
    },
    ingressClasses: data,
  }),
  [FETCH_INGRESS_CLASSES_ERROR]: (state, { payload }) => ({
    ...state,
    meta: {
      loading: computeLoading(state.meta.loading, 'ingressClasses', false),
      error: payload.error,
    },
  }),
  [FETCH_CLUSTER_INGRESS_HOSTS_REQUEST]: (state) => ({
    ...state,
    meta: {
      ...state.meta,
      loading: computeLoading(state.meta.loading, 'clusterIngressHosts', true),
    },
  }),
  [FETCH_CLUSTER_INGRESS_HOSTS_SUCCESS]: (state, { payload: { data } }) => ({
    ...state,
    meta: {
      ...state.meta,
      loading: computeLoading(state.meta.loading, 'clusterIngressHosts', false),
    },
    initialValues: {
      ...state.initialValues,
      clusterIngressHosts: {
        hosts: data.items,
      },
    },
  }),
  [FETCH_CLUSTER_INGRESS_HOSTS_ERROR]: (state, { payload }) => ({
    ...state,
    meta: {
      loading: computeLoading(state.meta.loading, 'clusterIngressHosts', false),
      error: payload.error,
    },
  }),
  [FETCH_CLUSTER_INGRESS_VARIABLES_REQUEST]: (state) => ({
    ...state,
    meta: {
      ...state.meta,
      loading: computeLoading(state.meta.loading, 'clusterIngressVariables', true),
    },
  }),
  [FETCH_CLUSTER_INGRESS_VARIABLES_SUCCESS]: (state, { payload: { data } }) => ({
    ...state,
    meta: {
      ...state.meta,
      loading: computeLoading(state.meta.loading, 'clusterIngressVariables', false),
    },
    initialValues: {
      ...state.initialValues,
      clusterIngressVariables: {
        variables: data.items,
      },
    },
  }),
  [FETCH_CLUSTER_INGRESS_VARIABLES_ERROR]: (state, { payload }) => ({
    ...state,
    meta: {
      loading: computeLoading(state.meta.loading, 'clusterIngressVariables', false),
      error: payload.error,
    },
  }),
  [FETCH_CLUSTER_INGRESS_CLASSES_REQUEST]: (state) => ({
    ...state,
    meta: {
      ...state.meta,
      loading: computeLoading(state.meta.loading, 'clusterIngressClasses', true),
    },
  }),
  [FETCH_CLUSTER_INGRESS_CLASSES_SUCCESS]: (state, { payload: { data } }) => ({
    ...state,
    meta: {
      ...state.meta,
      loading: computeLoading(state.meta.loading, 'clusterIngressClasses', false),
    },
    initialValues: {
      ...state.initialValues,
      clusterIngressClasses: {
        classes: data.items,
      },
    },
  }),
  [FETCH_CLUSTER_INGRESS_CLASSES_ERROR]: (state, { payload }) => ({
    ...state,
    meta: {
      loading: computeLoading(state.meta.loading, 'clusterIngressClasses', false),
      error: payload.error,
    },
  }),
}, defaultState);
