import { createAction, handleActions } from 'redux-actions';
import { createFormAction } from 'redux-form-saga';
import { get as _get } from 'lodash';
import computeLoading from './lib/computeLoading';
import {
  getFormValues as rfGetFormValues,
  getFormAsyncErrors as rfGetFormAsyncErrors,
} from 'redux-form';

const actionsPrefix = 'KUBERNAUT/NEW_INGRESS_VERSION';
export const initNewIngressVersionPage = createAction(`${actionsPrefix}/INITIALISE`);

export const FETCH_SERVICE_REQUEST = createAction(`${actionsPrefix}/FETCH_SERVICE_REQUEST`);
export const FETCH_SERVICE_SUCCESS = createAction(`${actionsPrefix}/FETCH_SERVICE_SUCCESS`);
export const FETCH_SERVICE_ERROR = createAction(`${actionsPrefix}/FETCH_SERVICE_ERROR`);

export const FETCH_INGRESS_HOSTS_REQUEST = createAction(`${actionsPrefix}/FETCH_INGRESS_HOSTS_REQUEST`);
export const FETCH_INGRESS_HOSTS_SUCCESS = createAction(`${actionsPrefix}/FETCH_INGRESS_HOSTS_SUCCESS`);
export const FETCH_INGRESS_HOSTS_ERROR = createAction(`${actionsPrefix}/FETCH_INGRESS_HOSTS_ERROR`);

export const FETCH_INGRESS_VARIABLES_REQUEST = createAction(`${actionsPrefix}/FETCH_INGRESS_VARIABLES_REQUEST`);
export const FETCH_INGRESS_VARIABLES_SUCCESS = createAction(`${actionsPrefix}/FETCH_INGRESS_VARIABLES_SUCCESS`);
export const FETCH_INGRESS_VARIABLES_ERROR = createAction(`${actionsPrefix}/FETCH_INGRESS_VARIABLES_ERROR`);

export const FETCH_INGRESS_CLASSES_REQUEST = createAction(`${actionsPrefix}/FETCH_INGRESS_CLASSES_REQUEST`);
export const FETCH_INGRESS_CLASSES_SUCCESS = createAction(`${actionsPrefix}/FETCH_INGRESS_CLASSES_SUCCESS`);
export const FETCH_INGRESS_CLASSES_ERROR = createAction(`${actionsPrefix}/FETCH_INGRESS_CLASSES_ERROR`);

export const FETCH_TEAM_REQUEST = createAction(`${actionsPrefix}/FETCH_TEAM_REQUEST`);
export const FETCH_TEAM_SUCCESS = createAction(`${actionsPrefix}/FETCH_TEAM_SUCCESS`);
export const FETCH_TEAM_ERROR = createAction(`${actionsPrefix}/FETCH_TEAM_ERROR`);

export const FETCH_INGRESS_VERSIONS_REQUEST = createAction(`${actionsPrefix}/FETCH_INGRESS_VERSIONS_REQUEST`);
export const FETCH_INGRESS_VERSIONS_SUCCESS = createAction(`${actionsPrefix}/FETCH_INGRESS_VERSIONS_SUCCESS`);
export const FETCH_INGRESS_VERSIONS_ERROR = createAction(`${actionsPrefix}/FETCH_INGRESS_VERSIONS_ERROR`);

export const canManageRequest = createAction(`${actionsPrefix}/CAN_MANAGE_REQUEST`);
export const setCanManage = createAction(`${actionsPrefix}/SET_CAN_MANAGE`);
export const canWriteIngressRequest = createAction(`${actionsPrefix}/CAN_WRITE_INGRESS_REQUEST`);
export const setCanWriteIngress = createAction(`${actionsPrefix}/SET_CAN_WRITE_INGRESS`);
export const submitForm = createFormAction(`${actionsPrefix}/SUBMIT_FORM`);
export const validateCustomHost = createAction(`${actionsPrefix}/VALIDATE_CUSTOM_HOST`);

export const getFormValues = (state) => rfGetFormValues('newIngressVersion')(state);
export const getFormAsyncErrors = (state) => rfGetFormAsyncErrors('newIngressVersion')(state);
export const selectService = (state) => state.newIngressVersion.service;

const initialRuleValues = {
  port: 80,
};

const initialEntryValues = {
  ingressClass: '',
  annotations: [],
  rules: [
    { ...initialRuleValues },
  ],
  name: '',
};

const defaultState = {
  initialEntryValues,
  initialValues: {
    comment: '',
    entries: [],
  },
  ingressClasses: [],
  ingressHostKeys: [],
  ingressVariables: [],
  meta: {
    loading: {
      sections: {
        service: false,
        ingressHosts: false,
        ingressVariables: false,
        ingressClasses: false,
        canManage: false,
        team: false,
        canWriteIngress: false,
        priorVersion: false,
      },
      loadingPercent: 100,
    },
  },
  service: {
    id: '',
    name: '',
    registry: {
      name: '',
    },
  },
  team: {
    name: '',
  },
  canManage: false,
  canWriteIngress: false,
};


export default handleActions({
  [initNewIngressVersionPage]: () => ({
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
    service: data,
  }),
  [FETCH_SERVICE_ERROR]: (state, { payload }) => ({
    ...state,
    meta: {
      ...state.meta,
      loading: computeLoading(state.meta.loading, 'service', false),
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
    ingressHostKeys: data.items.map(({ id, name }) => ({ value: id, display: name })),
  }),
  [FETCH_INGRESS_HOSTS_ERROR]: (state, { payload }) => ({
    ...state,
    meta: {
      ...state.meta,
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
    ingressVariables: ['service'].concat(data.items.map(({ name }) => (name))),
  }),
  [FETCH_INGRESS_VARIABLES_ERROR]: (state, { payload }) => ({
    ...state,
    meta: {
      ...state.meta,
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
    ingressClasses: data.items.map(({ id, name }) => ({ value: id, display: name })),
  }),
  [FETCH_INGRESS_CLASSES_ERROR]: (state, { payload }) => ({
    ...state,
    meta: {
      ...state.meta,
      loading: computeLoading(state.meta.loading, 'ingressClasses', false),
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
  [canWriteIngressRequest]: (state) => ({
    ...state,
    meta: {
      ...state.meta,
      loading: computeLoading(state.meta.loading, 'canWriteIngress', true),
    }
  }),
  [setCanWriteIngress]: (state, { payload }) => ({
    ...state,
    canWriteIngress: payload,
    meta: {
      ...state.meta,
      loading: computeLoading(state.meta.loading, 'canWriteIngress', false),
    },
  }),
  [FETCH_TEAM_REQUEST]: (state) => ({
    ...state,
    team: defaultState.team,
    meta: {
      ...state.meta,
      loading: computeLoading(state.meta.loading, 'team', true),
    },
  }),
  [FETCH_TEAM_SUCCESS]: (state, { payload }) => ({
    ...state,
    team: payload.data,
    meta: {
      ...state.meta,
      loading: computeLoading(state.meta.loading, 'team', false),
    },
  }),
  [FETCH_TEAM_ERROR]: (state, { payload }) => ({
    ...state,
    team: defaultState.team,
    meta: {
      ...state.meta,
      loading: computeLoading(state.meta.loading, 'team', false),
    },
  }),
  [FETCH_INGRESS_VERSIONS_REQUEST]: (state, { payload }) => ({
    ...state,
    meta: {
      loading: computeLoading(state.meta.loading, 'priorVersion', true),
    },
  }),
  [FETCH_INGRESS_VERSIONS_SUCCESS]: (state, { payload }) => {
    const newState = {
      ...state,
      meta: {
        loading: computeLoading(state.meta.loading, 'priorVersion', false),
      },
    };

    const version = payload.version;
    (version.entries || []).forEach(e => {
      e.ingressClass = _get(e, 'ingressClass.id', '');
      e.rules.forEach(r => {
        r.host = _get(r, 'ingressHostKey.id', '');
      });
    });

    if (payload && payload.version ) {
      newState.initialValues = {
        ...defaultState.initialValues,
        ...version,
        comment: '',
      };
    }

    return newState;
  },
  [FETCH_INGRESS_VERSIONS_ERROR]: (state, { payload }) => ({
    ...state,
    meta: {
      loading: computeLoading(state.meta.loading, 'priorVersion', false),
    },
  }),
}, defaultState);
