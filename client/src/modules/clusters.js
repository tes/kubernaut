import { createAction, handleActions, combineActions } from 'redux-actions';
import { createFormAction } from 'redux-form-saga';
import {
  getFormValues as rfGetFormValues,
} from 'redux-form';

const actionsPrefix = 'KUBERNAUT/CLUSTERS';

export const initialiseClustersPage = createAction(`${actionsPrefix}/INITIALISE`);
export const fetchClusters = createAction(`${actionsPrefix}/FETCH_CLUSTERS`);
export const fetchClustersPagination = createAction(`${actionsPrefix}/FETCH_CLUSTERS_PAGINATION`);
export const FETCH_CLUSTERS_REQUEST = createAction(`${actionsPrefix}/FETCH_CLUSTERS_REQUEST`);
export const FETCH_CLUSTERS_SUCCESS = createAction(`${actionsPrefix}/FETCH_CLUSTERS_SUCCESS`);
export const FETCH_CLUSTERS_ERROR = createAction(`${actionsPrefix}/FETCH_CLUSTERS_ERROR`);
export const setClusters = createAction(`${actionsPrefix}/SET_CLUSTERS`);
export const openModal = createAction(`${actionsPrefix}/OPEN_MODAL`);
export const closeModal = createAction(`${actionsPrefix}/CLOSE_MODAL`);
export const setPagination = createAction(`${actionsPrefix}/SET_PAGINATION`);


export const getFormValues = (state) => rfGetFormValues('newCluster')(state);
export const submitForm = createFormAction(`${actionsPrefix}/SUBMIT_FORM`);
export const selectPaginationState = (state) => (state.clusters.pagination);


const defaultState = {
  data: {
    limit: 0,
    offset: 0,
    count: 0,
    pages: 0,
    page: 0,
    items: [],
  },
  meta: {},
  initialValues: {
    name: '',
    config: '/config/.kube/kubeconfig',
    color: '',
    priority: '',
  },
  pagination: {
    page: 1,
    limit: 10,
  },
  newModalOpen: false,
};

export default handleActions({
  [initialiseClustersPage]: () => (defaultState),
  [FETCH_CLUSTERS_REQUEST]: (state) => ({
    ...state,
    data: {
      ...defaultState.data,
    },
    meta: {
      loading: true,
    },
  }),
  [FETCH_CLUSTERS_SUCCESS]: (state, { payload }) => ({
    ...state,
    data: payload.data,
    meta: {
      loading: false,
    },
  }),
  [FETCH_CLUSTERS_ERROR]: (state, { payload }) => ({
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
  [combineActions(fetchClustersPagination, setPagination)]: (state, { payload }) => ({
    ...state,
    pagination: {
      page: payload.page || defaultState.pagination.page,
      limit: payload.limit || defaultState.pagination.limit,
    },
  }),
}, defaultState);
