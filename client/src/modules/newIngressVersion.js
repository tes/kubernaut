import { createAction, handleActions } from 'redux-actions';
import { createFormAction } from 'redux-form-saga';
import computeLoading from './lib/computeLoading';
import {
  getFormValues as rfGetFormValues,
  getFormAsyncErrors as rfGetFormAsyncErrors,
} from 'redux-form';

const actionsPrefix = 'KUBERNAUT/NEW_INGRESS_VERSION';
// export const INITIALISE = createAction(`${actionsPrefix}/INITIALISE`);
// export const submitForm = createFormAction(`${actionsPrefix}/SUBMIT_FORM`);
//
// export const getFormValues = (state) => rfGetFormValues('newJobVersion')(state);
// export const getFormAsyncErrors = (state) => rfGetFormAsyncErrors('newJobVersion')(state);

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
  // meta: {
  //   loading: {
  //     sections: {
  //       job: false,
  //       priorVersion: false,
  //     },
  //     loadingPercent: 100,
  //   },
  // },
};


export default handleActions({

}, defaultState);
