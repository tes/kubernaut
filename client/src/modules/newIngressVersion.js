import { createAction, handleActions } from 'redux-actions';
import { createFormAction } from 'redux-form-saga';
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

export const FETCH_INGRESS_CLASSES_REQUEST = createAction(`${actionsPrefix}/FETCH_INGRESS_CLASSES_REQUEST`);
export const FETCH_INGRESS_CLASSES_SUCCESS = createAction(`${actionsPrefix}/FETCH_INGRESS_CLASSES_SUCCESS`);
export const FETCH_INGRESS_CLASSES_ERROR = createAction(`${actionsPrefix}/FETCH_INGRESS_CLASSES_ERROR`);

// export const submitForm = createFormAction(`${actionsPrefix}/SUBMIT_FORM`);
//
// export const getFormValues = (state) => rfGetFormValues('newJobVersion')(state);
// export const getFormAsyncErrors = (state) => rfGetFormAsyncErrors('newJobVersion')(state);
export const selectService = (state) => state.newIngressVersion.service;

const initialEntryValues = {
  ingressClass: 'some-uuid',
  annotations: [],
  rules: [],
};

const defaultState = {
  initialEntryValues,
  initialValues: {
    comment: 'bob',
    entries: [
      {
        ...initialEntryValues,
        name: 'something-generated-and-random',
        annotations: [
          {
            name: 'nginx.ingress.kubernetes.io/use-regex',
            value: 'true'
          },
          {
            name: 'nginx.ingress.kubernetes.io/configuration-snippet',
            value: 'more_set_headers "x-robots-tag: none";'
          },
        ],
        rules: [
          {
            path: '/api/bob',
            port: '80',
            host: 'some-uuid',
          },
          {
            path: '/',
            port: '80',
            host: '',
            customHost: '{{service}}.service.{{environment}}.tescloud.com',
          },
        ]
      },
      {
        ...initialEntryValues,
        name: 'something-else-random',
        annotations: [
          {
            name: 'nginx.ingress.kubernetes.io/rewrite-target',
            value: '/api/$1/$2'
          }
        ]
      },
    ],
  },
  ingressClasses: [
    {
      value: 'some-uuid',
      display: 'nginx-internal',
    },
  ],
  ingressHostKeys: [
    {
      value: 'some-uuid',
      display: 'tes-www',
    },
    {
      value: 'some-uuid-internal',
      display: 'tes-internal',
    },
  ],
  meta: {
    loading: {
      sections: {
        service: false,
        ingressHosts: false,
        ingressClasses: false,
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
}, defaultState);
