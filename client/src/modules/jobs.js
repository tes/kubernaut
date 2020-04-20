import { createAction, handleActions } from 'redux-actions';
import { createFormAction } from 'redux-form-saga';
import {
  getFormValues as rfGetFormValues,
} from 'redux-form';

const actionsPrefix = 'KUBERNAUT/JOBS';
export const initialiseJobsPage = createAction(`${actionsPrefix}/INITIALISE`);
export const fetchJobsPagination = createAction(`${actionsPrefix}/FETCH_JOBS_PAGINATION`);
export const FETCH_JOBS_REQUEST = createAction(`${actionsPrefix}/FETCH_JOBS_REQUEST`);
export const FETCH_JOBS_SUCCESS = createAction(`${actionsPrefix}/FETCH_JOBS_SUCCESS`);
export const FETCH_JOBS_ERROR = createAction(`${actionsPrefix}/FETCH_JOBS_ERROR`);
export const openModal = createAction(`${actionsPrefix}/OPEN_MODAL`);
export const closeModal = createAction(`${actionsPrefix}/CLOSE_MODAL`);
export const submitForm = createFormAction(`${actionsPrefix}/SUBMIT_FORM`);
export const setNamespaces = createAction(`${actionsPrefix}/SET_NAMESPACES`);
export const getFormValues = (state) => rfGetFormValues('newJob')(state);

const defaultState = {
  data: {
    limit: 0,
    offset: 0,
    count: 0,
    pages: 0,
    page: 0,
    items: [],
  },
  namespaces: {
    limit: 0,
    offset: 0,
    count: 0,
    pages: 0,
    page: 0,
    items: [],
  },
  meta: {},
  newModalOpen: false,
  canCreate: false,
  initialValues: {
    name: '',
    namespace: '',
  }
};

export default handleActions({
  [initialiseJobsPage]: () => ({
    ...defaultState,
  }),
  [FETCH_JOBS_REQUEST]: (state) => ({
    ...state,
    meta: {
      loading: true,
    },
  }),
  [FETCH_JOBS_SUCCESS]: (state, { payload }) => ({
    ...state,
    data: payload.data,
    meta: {
      loading: false,
    },
  }),
  [FETCH_JOBS_ERROR]: (state, { payload }) => ({
    ...state,
    meta: {
      error: payload.error,
      loading: false,
    },
  }),
  [openModal]: (state) => ({
    ...state,
    newModalOpen: true,
  }),
  [closeModal]: (state) => ({
    ...state,
    newModalOpen: false,
  }),
  [setNamespaces]: (state, { payload }) => ({
    ...state,
    namespaces: payload.data,
    canCreate: payload.data.count > 0,
  }),
}, defaultState);
