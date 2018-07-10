import { createAction, combineActions, handleActions } from 'redux-actions';
const actionsPrefix = 'KUBERNAUT/DEPLOYMENT';
export const FETCH_DEPLOYMENT_REQUEST = createAction(`${actionsPrefix}/FETCH_DEPLOYMENT_REQUEST`);
export const FETCH_DEPLOYMENT_SUCCESS = createAction(`${actionsPrefix}/FETCH_DEPLOYMENT_SUCCESS`);
export const FETCH_DEPLOYMENT_ERROR = createAction(`${actionsPrefix}/FETCH_DEPLOYMENT_ERROR`);

export function fetchDeployment(id, options = { quiet: false }) {
  return async (dispatch) => {
    let data = {};
    dispatch(FETCH_DEPLOYMENT_REQUEST({ data, loading: true }));

    try {
      const url = `/api/deployments/${id}`;
      const res = await fetch(url, { method: 'GET', timeout: options.timeout, credentials: 'same-origin' });
      if (res.status >= 400) throw new Error(`${url} returned ${res.status} ${res.statusText}`);
      data = await res.json();
    } catch(error) {
      if (options.quiet !== true) console.error(error); // eslint-disable-line no-console
      return dispatch(FETCH_DEPLOYMENT_ERROR({ data, error }));
    }

    return dispatch(FETCH_DEPLOYMENT_SUCCESS({ data }));
  };
}

export default handleActions({
  [combineActions(FETCH_DEPLOYMENT_REQUEST, FETCH_DEPLOYMENT_SUCCESS, FETCH_DEPLOYMENT_ERROR)]: (state, { payload }) => ({
    ...state,
    data: {
      ...payload.data,
    },
    meta: {
      error: payload.error,
      loading: !!payload.loading,
    },
  }),
}, {});
