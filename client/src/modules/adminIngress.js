import { createAction, handleActions, combineActions } from 'redux-actions';
import { createFormAction } from 'redux-form-saga';
import {
  getFormValues as rfGetFormValues,
} from 'redux-form';

const actionsPrefix = 'KUBERNAUT/ADMIN_INGRESS';

export const initialiseAdminIngressPage = createAction(`${actionsPrefix}/INITIALISE`);
export const fetchHostKeys = createAction(`${actionsPrefix}/FETCH_HOST_KEYS`);
export const fetchHostKeysPagination = createAction(`${actionsPrefix}/FETCH_HOST_KEYS_PAGINATION`);
export const FETCH_HOST_KEYS_REQUEST = createAction(`${actionsPrefix}/FETCH_HOST_KEYS_REQUEST`);
export const FETCH_HOST_KEYS_SUCCESS = createAction(`${actionsPrefix}/FETCH_HOST_KEYS_SUCCESS`);
export const FETCH_HOST_KEYS_ERROR = createAction(`${actionsPrefix}/FETCH_HOST_KEYS_ERROR`);

export const fetchVariableKeys = createAction(`${actionsPrefix}/FETCH_VARIABLE_KEYS`);
export const fetchVariableKeysPagination = createAction(`${actionsPrefix}/FETCH_VARIABLE_KEYS_PAGINATION`);
export const FETCH_VARIABLE_KEYS_REQUEST = createAction(`${actionsPrefix}/FETCH_VARIABLE_KEYS_REQUEST`);
export const FETCH_VARIABLE_KEYS_SUCCESS = createAction(`${actionsPrefix}/FETCH_VARIABLE_KEYS_SUCCESS`);
export const FETCH_VARIABLE_KEYS_ERROR = createAction(`${actionsPrefix}/FETCH_VARIABLE_KEYS_ERROR`);

export const fetchClasses = createAction(`${actionsPrefix}/FETCH_CLASSES`);
export const fetchClassesPagination = createAction(`${actionsPrefix}/FETCH_CLASSES_PAGINATION`);
export const FETCH_CLASSES_REQUEST = createAction(`${actionsPrefix}/FETCH_CLASSES_REQUEST`);
export const FETCH_CLASSES_SUCCESS = createAction(`${actionsPrefix}/FETCH_CLASSES_SUCCESS`);
export const FETCH_CLASSES_ERROR = createAction(`${actionsPrefix}/FETCH_CLASSES_ERROR`);

export const setHostPagination = createAction(`${actionsPrefix}/SET_HOST_PAGINATION`);
export const setVariablePagination = createAction(`${actionsPrefix}/SET_VARIABLE_PAGINATION`);
export const setClassPagination = createAction(`${actionsPrefix}/SET_CLASS_PAGINATION`);

export const getFormValues = (state) => rfGetFormValues('newIngressKeys')(state);
export const submitHostForm = createFormAction(`${actionsPrefix}/SUBMIT_HOST_FORM`);
export const submitVariableForm = createFormAction(`${actionsPrefix}/SUBMIT_VARIABLE_FORM`);
export const submitClassForm = createFormAction(`${actionsPrefix}/SUBMIT_CLASS_FORM`);
export const selectHostPaginationState = (state) => (state.adminIngress.hostPagination);
export const selectVariablePaginationState = (state) => (state.adminIngress.variablePagination);
export const selectClassPaginationState = (state) => (state.adminIngress.classPagination);


const defaultState = {
  hosts: {
    limit: 0,
    offset: 0,
    count: 0,
    pages: 0,
    page: 0,
    items: [],
  },
  variables: {
    limit: 0,
    offset: 0,
    count: 0,
    pages: 0,
    page: 0,
    items: [],
  },
  classes: {
    limit: 0,
    offset: 0,
    count: 0,
    pages: 0,
    page: 0,
    items: [],
  },
  meta: {},
  initialValues: {
    newHost: {
      name: '',
    },
    newVariable: {
      name: '',
    },
    newClass: {
      name: '',
    },
  },
  hostPagination: {
    page: 1,
    limit: 10,
  },
  variablePagination: {
    page: 1,
    limit: 10,
  },
  classPagination: {
    page: 1,
    limit: 10,
  },
};

export default handleActions({
  [initialiseAdminIngressPage]: () => (defaultState),
  [FETCH_HOST_KEYS_REQUEST]: (state) => ({
    ...state,
    hosts: {
      ...defaultState.hosts,
    },
    meta: {
      loading: true,
    },
  }),
  [FETCH_HOST_KEYS_SUCCESS]: (state, { payload }) => ({
    ...state,
    hosts: payload.data,
    meta: {
      loading: false,
    },
  }),
  [FETCH_HOST_KEYS_ERROR]: (state, { payload }) => ({
    ...state,
    meta: {
      error: payload.error,
      loading: false,
    },
  }),
  [FETCH_VARIABLE_KEYS_REQUEST]: (state) => ({
    ...state,
    variables: {
      ...defaultState.variables,
    },
    meta: {
      loading: true,
    },
  }),
  [FETCH_VARIABLE_KEYS_SUCCESS]: (state, { payload }) => ({
    ...state,
    variables: payload.data,
    meta: {
      loading: false,
    },
  }),
  [FETCH_VARIABLE_KEYS_ERROR]: (state, { payload }) => ({
    ...state,
    meta: {
      error: payload.error,
      loading: false,
    },
  }),
  [FETCH_CLASSES_REQUEST]: (state) => ({
    ...state,
    classes: {
      ...defaultState.classes,
    },
    meta: {
      loading: true,
    },
  }),
  [FETCH_CLASSES_SUCCESS]: (state, { payload }) => ({
    ...state,
    classes: payload.data,
    meta: {
      loading: false,
    },
  }),
  [FETCH_CLASSES_ERROR]: (state, { payload }) => ({
    ...state,
    meta: {
      error: payload.error,
      loading: false,
    },
  }),
  [combineActions(fetchHostKeysPagination, setHostPagination)]: (state, { payload }) => ({
    ...state,
    hostPagination: {
      page: payload.page || defaultState.hostPagination.page,
      limit: payload.limit || defaultState.hostPagination.limit,
    },
  }),
  [combineActions(fetchVariableKeysPagination, setVariablePagination)]: (state, { payload }) => ({
    ...state,
    variablePagination: {
      page: payload.page || defaultState.variablePagination.page,
      limit: payload.limit || defaultState.variablePagination.limit,
    },
  }),
  [combineActions(fetchClassesPagination, setClassPagination)]: (state, { payload }) => ({
    ...state,
    classPagination: {
      page: payload.page || defaultState.classPagination.page,
      limit: payload.limit || defaultState.classPagination.limit,
    },
  }),
}, defaultState);
