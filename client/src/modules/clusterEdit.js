import { createAction, handleActions } from 'redux-actions';
import { createFormAction } from 'redux-form-saga';
import computeLoading from './lib/computeLoading';

const actionsPrefix = 'KUBERNAUT/CLUSTER_EDIT';
export const initClusterEditPage = createAction(`${actionsPrefix}/INIT_FORM`);
export const submitForm = createFormAction(`${actionsPrefix}/SUBMIT_FORM`);
export const FETCH_CLUSTER_REQUEST = createAction(`${actionsPrefix}/FETCH_CLUSTER_REQUEST`);
export const FETCH_CLUSTER_SUCCESS = createAction(`${actionsPrefix}/FETCH_CLUSTER_SUCCESS`);
export const FETCH_CLUSTER_ERROR = createAction(`${actionsPrefix}/FETCH_CLUSTER_ERROR`);

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
      },
      loadingPercent: 100,
    }
  },
  initialValues: {},
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
      ...data,
    },
  }),
  [FETCH_CLUSTER_ERROR]: (state, { payload }) => ({
    ...state,
    meta: {
      loading: computeLoading(state.meta.loading, 'cluster', false),
      error: payload.error,
    },
  }),
}, defaultState);
