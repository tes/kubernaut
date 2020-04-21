import { createAction, handleActions } from 'redux-actions';
import { createFormAction } from 'redux-form-saga';
import computeLoading from './lib/computeLoading';
import {
  getFormValues as rfGetFormValues,
} from 'redux-form';

const actionsPrefix = 'KUBERNAUT/NEW_JOB_VERSION';
export const INITIALISE = createAction(`${actionsPrefix}/INITIALISE`);
export const toggleCollapsed = createAction(`${actionsPrefix}/TOGGLE_COLLAPSED`);
export const triggerPreview = createAction(`${actionsPrefix}/TRIGGER_PREVIEW`);
export const updatePreview = createAction(`${actionsPrefix}/UPDATE_PREVIEW`);

export const submitForm = createFormAction(`${actionsPrefix}/SUBMIT_FORM`);

export const FETCH_JOB_REQUEST = createAction(`${actionsPrefix}/FETCH_JOB_REQUEST`);
export const FETCH_JOB_SUCCESS = createAction(`${actionsPrefix}/FETCH_JOB_SUCCESS`);
export const FETCH_JOB_ERROR = createAction(`${actionsPrefix}/FETCH_JOB_ERROR`);
export const FETCH_JOB_VERSIONS_REQUEST = createAction(`${actionsPrefix}/FETCH_JOB_VERSIONS_REQUEST`);
export const FETCH_JOB_VERSIONS_SUCCESS = createAction(`${actionsPrefix}/FETCH_JOB_VERSIONS_SUCCESS`);
export const FETCH_JOB_VERSIONS_ERROR = createAction(`${actionsPrefix}/FETCH_JOB_VERSIONS_ERROR`);

export const selectJob = (state) => (state.newJobVersion.job.data);
export const getFormValues = (state) => rfGetFormValues('newJobVersion')(state);

const defaultState = {
  initialValues: {},
  meta: {
    loading: {
      sections: {
        job: false,
        priorVersion: false,
      },
      loadingPercent: 100,
    },
  },
  collapsed: {
    initContainers: true,
    containers: false,
    volumes: true,
  },
  job: {
    data: {
      name: '',
      registry: {
        name: '',
      },
    },
  },
  preview: '',
};


export default handleActions({
  [INITIALISE]: () => ({ ...defaultState }),
  [toggleCollapsed]: (state, { payload }) => ({
    ...state,
    collapsed: {
      ...state.collapsed,
      [payload]: !state.collapsed[payload] || false, // in case we get undefined, just make it false.
    }
  }),
  [FETCH_JOB_REQUEST]: (state) => ({
    ...state,
    meta: {
      loading: computeLoading(state.meta.loading, { job: true, priorVersion: true }),
    },
    job: {
      ...state.job,
    },
  }),
  [FETCH_JOB_SUCCESS]: (state, { payload }) => ({
    ...state,
    meta: {
      loading: computeLoading(state.meta.loading, 'job', false),
    },
    job: {
      ...state.job,
      data: payload.data,
    },
  }),
  [FETCH_JOB_ERROR]: (state, { payload }) => ({
    ...state,
    meta: {
      loading: computeLoading(state.meta.loading, 'job', false),
    },
    job: {
      ...state.job,
    },
  }),
  [FETCH_JOB_VERSIONS_SUCCESS]: (state, { payload }) => {
    const newState = {
      ...state,
      meta: {
        loading: computeLoading(state.meta.loading, 'priorVersion', false),
      },
    };

    if (payload && payload.version ) {
      newState.initialValues = payload.version.values;
    }
    return newState;
  },
  [FETCH_JOB_VERSIONS_ERROR]: (state, { payload }) => ({
    ...state,
    meta: {
      loading: computeLoading(state.meta.loading, 'priorVersion', false),
    },
  }),
  [updatePreview]: (state, { payload }) => ({
    ...state,
    preview: payload.yaml,
  }),
}, defaultState);
