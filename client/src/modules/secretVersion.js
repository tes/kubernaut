import { createAction, handleActions } from 'redux-actions';
import computeLoading from './lib/computeLoading';
const actionsPrefix = 'KUBERNAUT/SECRET_VERSION';

export const FETCH_VERSION_REQUEST = createAction(`${actionsPrefix}/FETCH_VERSION_REQUEST`);
export const FETCH_VERSION_SUCCESS = createAction(`${actionsPrefix}/FETCH_VERSION_SUCCESS`);
export const FETCH_VERSION_ERROR = createAction(`${actionsPrefix}/FETCH_VERSION_ERROR`);
export const fetchVersion = createAction(`${actionsPrefix}/FETCH_VERSION`);

const defaultState = {
  meta: {
    loading: {
      sections: {
        version: false,
      },
      loadingPercent: 100,
    },
  },
  version: {
    service: {
      name: '',
      registry: {
        name: ''
      },
    },
    namespace: {
      name: '',
      cluster: {
        name: '',
      },
    },
  },
};

export default handleActions({
  [fetchVersion]: () => ({
    ...defaultState,
  }),
  [FETCH_VERSION_REQUEST]: (state) => ({
    ...state,
    meta: {
      ...state.meta,
      loading: computeLoading(state.meta.loading, 'version', true),
    },
  }),
  [FETCH_VERSION_SUCCESS]: (state, { payload: { data } }) => ({
    ...state,
    meta: {
      ...state.meta,
      loading: computeLoading(state.meta.loading, 'version', false),
    },
    version: data,
  }),
  [FETCH_VERSION_ERROR]: (state, { payload }) => ({
    ...state,
    meta: {
      ...state.meta,
      loading: computeLoading(state.meta.loading, 'version', false),
      error: payload.error,
    },
  }),
}, defaultState);
