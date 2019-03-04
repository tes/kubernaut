import { createAction, handleActions } from 'redux-actions';
import { createFormAction } from 'redux-form-saga';
import computeLoading from './lib/computeLoading';

const actionsPrefix = 'KUBERNAUT/NAMESPACE_EDIT';
export const initForm = createAction(`${actionsPrefix}/INIT_FORM`);

export const FETCH_NAMESPACE_REQUEST = createAction(`${actionsPrefix}/FETCH_NAMESPACE_REQUEST`);
export const FETCH_NAMESPACE_SUCCESS = createAction(`${actionsPrefix}/FETCH_NAMESPACE_SUCCESS`);
export const FETCH_NAMESPACE_ERROR = createAction(`${actionsPrefix}/FETCH_NAMESPACE_ERROR`);

export const FETCH_CLUSTERS_REQUEST = createAction(`${actionsPrefix}/FETCH_CLUSTERS_REQUEST`);
export const FETCH_CLUSTERS_SUCCESS = createAction(`${actionsPrefix}/FETCH_CLUSTERS_SUCCESS`);
export const FETCH_CLUSTERS_ERROR = createAction(`${actionsPrefix}/FETCH_CLUSTERS_ERROR`);
export const submitForm = createFormAction(`${actionsPrefix}/SUBMIT_FORM`);

export const canEditRequest = createAction(`${actionsPrefix}/CAN_EDIT_REQUEST`);
export const setCanEdit = createAction(`${actionsPrefix}/SET_CAN_EDIT`);
export const canManageRequest = createAction(`${actionsPrefix}/CAN_MANAGE_REQUEST`);
export const setCanManage = createAction(`${actionsPrefix}/SET_CAN_MANAGE`);

export const selectNamespaceId = (state) => (state.namespaceEdit.id);

const defaultState = {
  id: '',
  name: '',
  color: '',
  cluster: '',
  canEdit: false,
  canManage: false,
  meta: {
    loading: {
      sections: {
        clusters: false,
        namespace: false,
        canEdit: false,
        canManage: false,
      },
      loadingPercent: 100,
    }
  },
  initialValues: {},
  clusters: {
    data: {
      items: [],
    },
  }
};

export default handleActions({
  [initForm]: () => ({
    ...defaultState,
  }),
  [FETCH_CLUSTERS_REQUEST]: (state) => ({
    ...state,
    clusters: defaultState.clusters,
    meta: {
      ...state.meta,
      loading: computeLoading(state.meta.loading, 'clusters', true),
    }
  }),
  [FETCH_CLUSTERS_SUCCESS]: (state, { payload }) => ({
    ...state,
    clusters: {
      data: payload.data,
    },
    meta: {
      ...state.meta,
      loading: computeLoading(state.meta.loading, 'clusters', false),
    }
  }),
  [FETCH_CLUSTERS_ERROR]: (state, { payload }) => ({
    ...state,
    clusters: {
      error: payload.error,
    },
    meta: {
      ...state.meta,
      loading: computeLoading(state.meta.loading, 'clusters', false),
    },
  }),
  [FETCH_NAMESPACE_REQUEST]: (state) => ({
    ...state,
    meta: {
      ...state.meta,
      loading: computeLoading(state.meta.loading, 'namespace', true),
    },
  }),
  [FETCH_NAMESPACE_SUCCESS]: (state, { payload: { data } }) => ({
    ...state,
    meta: {
      ...state.meta,
      loading: computeLoading(state.meta.loading, 'namespace', false),
    },
    id: data.id,
    name: data.name,
    cluster: data.cluster.name,
    color: data.color || data.cluster.color,
    initialValues: {
      context: data.context || '',
      color: data.color || '',
      cluster: data.cluster.id || '',
      attributes: Object.keys(data.attributes).reduce((arr, attr) => {
        return arr.concat({ name: attr, value: data.attributes[attr], tempKey: Math.random() });
      }, []),
    },
  }),
  [FETCH_NAMESPACE_ERROR]: (state, { payload }) => ({
    ...state,
    meta: {
      loading: computeLoading(state.meta.loading, 'namespace', false),
      error: payload.error,
    },
  }),
  [canEditRequest]: (state) => ({
    ...state,
    meta: {
      ...state.meta,
      loading: computeLoading(state.meta.loading, 'canEdit', true),
    }
  }),
  [setCanEdit]: (state, { payload }) => ({
    ...state,
    canEdit: payload,
    meta: {
      ...state.meta,
      loading: computeLoading(state.meta.loading, 'canEdit', false),
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
}, defaultState);
