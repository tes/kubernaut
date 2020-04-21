import { createAction, handleActions } from 'redux-actions';
import computeLoading from './lib/computeLoading';

const actionsPrefix = 'KUBERNAUT/JOB_VERSION';
export const initialiseJobVersionPage = createAction(`${actionsPrefix}/INITIALISE`);

export const FETCH_JOB_VERSION_REQUEST = createAction(`${actionsPrefix}/FETCH_JOB_VERSION_REQUEST`);
export const FETCH_JOB_VERSION_SUCCESS = createAction(`${actionsPrefix}/FETCH_JOB_VERSION_SUCCESS`);
export const FETCH_JOB_VERSION_ERROR = createAction(`${actionsPrefix}/FETCH_JOB_VERSION_ERROR`);
export const apply = createAction(`${actionsPrefix}/APPLY`);
export const closeModal = createAction(`${actionsPrefix}/CLOSE_MODAL`);
export const setLogOutput = createAction(`${actionsPrefix}/SET_LOG_OUTPUT`);
export const setLogOutputError = createAction(`${actionsPrefix}/SET_LOG_OUTPUT_ERROR`);

export const selectJobVersion = (state) => (state.jobVersion.jobVersion.data);

const defaultState = {
  meta: {
    loading: {
      sections: {
        jobVersion: false,
      },
      loadingPercent: 100,
    },
  },
  jobVersion: {
    data: {
      id: '',
      job: {
        id: '',
        name: '',
        registry: {
          name: '',
        },
      },
      createdBy: {
        id: '',
      },
    },
  },
  applyLog: [],
  applyError: '',
  logOpen : false,
};

export default handleActions({
  [initialiseJobVersionPage]: () => ({
    ...defaultState,
  }),
  [FETCH_JOB_VERSION_REQUEST]: (state) => ({
    ...state,
    meta: {
      loading: computeLoading(state.meta.loading, 'jobVersion', true),
    },
    jobVersion: {
      ...state.jobVersion,
    },
  }),
  [FETCH_JOB_VERSION_SUCCESS]: (state, { payload }) => ({
    ...state,
    meta: {
      loading: computeLoading(state.meta.loading, 'jobVersion', false),
    },
    jobVersion: {
      ...state.jobVersion,
      data: payload.data,
    },
  }),
  [FETCH_JOB_VERSION_ERROR]: (state, { payload }) => ({
    ...state,
    meta: {
      loading: computeLoading(state.meta.loading, 'jobVersion', false),
    },
    job: {
      ...state.jobVersion,
    },
  }),
  [setLogOutput]: (state, { payload }) => ({
    ...state,
    logOpen: true,
    applyLog: payload.log,
  }),
  [setLogOutputError]: (state, { payload }) => ({
    ...state,
    logOpen: true,
    applyError: payload,
  }),
  [closeModal]: (state) => ({
    ...state,
    logOpen: false,
  }),
}, defaultState);
