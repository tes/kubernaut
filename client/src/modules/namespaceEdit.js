import { createAction, handleActions } from 'redux-actions';
const actionsPrefix = 'KUBERNAUT/NAMESPACE_EDIT';
export const initForm = createAction(`${actionsPrefix}/INIT_FORM`);

export const FETCH_NAMESPACE_REQUEST = createAction(`${actionsPrefix}/FETCH_NAMESPACE_REQUEST`);
export const FETCH_NAMESPACE_SUCCESS = createAction(`${actionsPrefix}/FETCH_NAMESPACE_SUCCESS`);
export const FETCH_NAMESPACE_ERROR = createAction(`${actionsPrefix}/FETCH_NAMESPACE_ERROR`);

export const FETCH_CLUSTERS_REQUEST = createAction(`${actionsPrefix}/FETCH_CLUSTERS_REQUEST`);
export const FETCH_CLUSTERS_SUCCESS = createAction(`${actionsPrefix}/FETCH_CLUSTERS_SUCCESS`);
export const FETCH_CLUSTERS_ERROR = createAction(`${actionsPrefix}/FETCH_CLUSTERS_ERROR`);


const defaultState = {
  name: '',
  color: '',
  cluster: '',
  meta: {},
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
  }),
  [FETCH_CLUSTERS_SUCCESS]: (state, { payload }) => ({
    ...state,
    clusters: {
      data: payload.data,
    },
  }),
  [FETCH_CLUSTERS_ERROR]: (state, { payload }) => ({
    ...state,
    clusters: {
      error: payload.error,
    }
  }),
  [FETCH_NAMESPACE_REQUEST]: (state) => ({
    ...state,
    meta: {
      loading: true
    },
  }),
  [FETCH_NAMESPACE_SUCCESS]: (state, { payload: { data } }) => ({
    ...state,
    meta: {
      loading: false,
    },
    name: data.name,
    cluster: data.cluster.name,
    color: data.color || data.cluster.color,
    initialValues: {
      context: data.context,
      color: data.color,
      cluster: data.cluster.id,
      attributes: Object.keys(data.attributes).reduce((arr, attr) => {
        return arr.concat({ name: attr, value: data.attributes[attr] });
      }, []),
    },
  }),
  [FETCH_NAMESPACE_ERROR]: (state, { payload }) => ({
    ...state,
    meta: {
      loading: false,
      error: payload.error,
    },
  }),
}, defaultState);
