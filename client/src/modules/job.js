import { createAction, handleActions, combineActions } from 'redux-actions';
import {
  getFormValues as rfGetFormValues,
} from 'redux-form';
import computeLoading from './lib/computeLoading';

const actionsPrefix = 'KUBERNAUT/JOB';
export const initialiseJobPage = createAction(`${actionsPrefix}/INITIALISE`);
export const fetchJobPageData = createAction(`${actionsPrefix}/FETCH_JOB_PAGE_DATA`);
export const fetchVersions = createAction(`${actionsPrefix}/FETCH_VERSIONS`);
export const fetchSnapshot = createAction(`${actionsPrefix}/FETCH_SNAPSHOT`);
export const fetchVersionsPagination = createAction(`${actionsPrefix}/FETCH_VERSIONS_PAGINATION`);

export const submitDescription = createAction(`${actionsPrefix}/SUBMIT_DESCRIPTION`);

export const FETCH_JOB_REQUEST = createAction(`${actionsPrefix}/FETCH_JOB_REQUEST`);
export const FETCH_JOB_SUCCESS = createAction(`${actionsPrefix}/FETCH_JOB_SUCCESS`);
export const FETCH_JOB_ERROR = createAction(`${actionsPrefix}/FETCH_JOB_ERROR`);
export const FETCH_JOB_VERSIONS_REQUEST = createAction(`${actionsPrefix}/FETCH_JOB_VERSIONS_REQUEST`);
export const FETCH_JOB_VERSIONS_SUCCESS = createAction(`${actionsPrefix}/FETCH_JOB_VERSIONS_SUCCESS`);
export const FETCH_JOB_VERSIONS_ERROR = createAction(`${actionsPrefix}/FETCH_JOB_VERSIONS_ERROR`);
export const FETCH_JOB_SNAPSHOT_REQUEST = createAction(`${actionsPrefix}/FETCH_JOB_SNAPSHOT_REQUEST`);
export const FETCH_JOB_SNAPSHOT_SUCCESS = createAction(`${actionsPrefix}/FETCH_JOB_SNAPSHOT_SUCCESS`);
export const FETCH_JOB_SNAPSHOT_ERROR = createAction(`${actionsPrefix}/FETCH_JOB_SNAPSHOT_ERROR`);

export const setCanEdit = createAction(`${actionsPrefix}/SET_CAN_EDIT`);
export const setCanApply = createAction(`${actionsPrefix}/SET_CAN_APPLY`);
export const setPagination = createAction(`${actionsPrefix}/SET_PAGINATION`);

export const execute = createAction(`${actionsPrefix}/EXECUTE`);
export const closeModal = createAction(`${actionsPrefix}/CLOSE_MODAL`);
export const setLogOutput = createAction(`${actionsPrefix}/SET_LOG_OUTPUT`);
export const setLogOutputError = createAction(`${actionsPrefix}/SET_LOG_OUTPUT_ERROR`);
export const editDescription = createAction(`${actionsPrefix}/EDIT_DESCRIPTION`);

export const selectJob = (state) => (state.job.job.data);
export const selectPaginationState = (state) => (state.job.versions.pagination);
export const getFormValues = (state) => rfGetFormValues('jobPage')(state);

const defaultState = {
  meta: {
    loading: {
      sections: {
        job: false,
        versions: false,
        snapshot: false,
      },
      loadingPercent: 100,
    },
  },
  job: {
    data: {
      name: '',
      description: '',
      registry: {
        name: '',
      },
    },
  },
  versions: {
    data: {
      limit: 0,
      offset: 0,
      count: 0,
      pages: 0,
      page: 0,
      items: [],
    },
    pagination: {
      page: 1,
      limit: 20,
    },
  },
  snapshot: null,
  applyLog: [],
  applyError: '',
  logOpen : false,
  canEdit: false,
  canApply: false,
  editDescriptionOpen: false,
};

export default handleActions({
  [fetchJobPageData]: () => ({
    ...defaultState,
  }),
  [FETCH_JOB_REQUEST]: (state) => ({
    ...state,
    meta: {
      loading: computeLoading(state.meta.loading, 'job', true),
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
    initialValues: {
      description: payload.data.description,
    },
    editDescriptionOpen: false,
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
  [setCanEdit]: (state, { payload }) => ({
    ...state,
    canEdit: payload,
  }),
  [setCanApply]: (state, { payload }) => ({
    ...state,
    canApply: payload,
  }),
  [FETCH_JOB_VERSIONS_REQUEST]: (state) => ({
    ...state,
    meta: {
      loading: computeLoading(state.meta.loading, 'versions', true),
    },
  }),
  [FETCH_JOB_VERSIONS_SUCCESS]: (state, { payload }) => ({
    ...state,
    meta: {
      loading: computeLoading(state.meta.loading, 'versions', false),
    },
    versions: {
      ...state.versions,
      data: payload.data,
    },
  }),
  [FETCH_JOB_VERSIONS_ERROR]: (state, { payload }) => ({
    ...state,
    meta: {
      loading: computeLoading(state.meta.loading, 'versions', false),
    },
    versions: {
      ...state.versions,
    },
  }),
  [combineActions(fetchVersionsPagination, setPagination)]: (state, { payload }) => ({
    ...state,
    versions: {
      ...state.versions,
      pagination: {
        page: payload.page || defaultState.versions.pagination.page,
        limit: payload.limit || defaultState.versions.pagination.limit,
      },
    },
  }),
  [FETCH_JOB_SNAPSHOT_REQUEST]: (state) => ({
    ...state,
    meta: {
      loading: computeLoading(state.meta.loading, 'snapshot', true),
    },
  }),
  [FETCH_JOB_SNAPSHOT_SUCCESS]: (state, { payload }) => ({
    ...state,
    meta: {
      loading: computeLoading(state.meta.loading, 'snapshot', false),
    },
    snapshot: payload.data,
  }),
  [FETCH_JOB_SNAPSHOT_ERROR]: (state, { payload }) => ({
    ...state,
    meta: {
      loading: computeLoading(state.meta.loading, 'snapshot', false),
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
  [editDescription]: (state) => ({
    ...state,
    editDescriptionOpen: true,
  }),
}, defaultState);
