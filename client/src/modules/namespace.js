import { createAction, handleActions } from 'redux-actions';
const actionsPrefix = 'KUBERNAUT/NAMESPACE';
export const fetchNamespace = createAction(`${actionsPrefix}/FETCH_NAMESPACE`);
export const FETCH_NAMESPACE_REQUEST = createAction(`${actionsPrefix}/FETCH_NAMESPACE_REQUEST`);
export const FETCH_NAMESPACE_SUCCESS = createAction(`${actionsPrefix}/FETCH_NAMESPACE_SUCCESS`);
export const FETCH_NAMESPACE_ERROR = createAction(`${actionsPrefix}/FETCH_NAMESPACE_ERROR`);

const defaultState = {
  meta: {},
  data: {
    cluster: {},
    attributes: {},
  },
};

export default handleActions({
  [FETCH_NAMESPACE_REQUEST]: () => ({ ...defaultState, meta: { loading: true } }),
  [FETCH_NAMESPACE_SUCCESS]: (state, { payload }) => ({
    ...state,
    meta: {
      loading: false,
    },
    data: payload.data,
  }),
  [FETCH_NAMESPACE_ERROR]: (state, { payload }) => ({
    ...state,
    meta: {
      loading: false,
      error: payload.error,
    }
  }),
}, defaultState);
