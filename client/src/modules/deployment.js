import { createAction, handleActions } from 'redux-actions';
const actionsPrefix = 'KUBERNAUT/DEPLOYMENT';
export const fetchDeployment = createAction(`${actionsPrefix}/FETCH_DEPLOYMENT`);
export const FETCH_DEPLOYMENT_REQUEST = createAction(`${actionsPrefix}/FETCH_DEPLOYMENT_REQUEST`);
export const FETCH_DEPLOYMENT_SUCCESS = createAction(`${actionsPrefix}/FETCH_DEPLOYMENT_SUCCESS`);
export const FETCH_DEPLOYMENT_ERROR = createAction(`${actionsPrefix}/FETCH_DEPLOYMENT_ERROR`);

const defaultState = {
  data: null,
  meta: {},
};

export default handleActions({
  [FETCH_DEPLOYMENT_REQUEST]: () => ({
    ...defaultState,
    meta: {
      loading: true,
    },
  }),
  [FETCH_DEPLOYMENT_SUCCESS]: (state, { payload }) => ({
    ...state,
    data: payload.data,
    meta: {
      loading: false,
    },
  }),
  [FETCH_DEPLOYMENT_ERROR]: (state, { payload }) => ({
    ...state,
    meta: {
      error: payload.error,
    },
  }),
}, defaultState);
