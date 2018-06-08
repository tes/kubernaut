const actionsPrefix = 'KUBERNAUT/DEPLOYMENT';
export const FETCH_DEPLOYMENT_REQUEST = `${actionsPrefix}/FETCH_DEPLOYMENT_REQUEST`;
export const FETCH_DEPLOYMENT_SUCCESS = `${actionsPrefix}/FETCH_DEPLOYMENT_SUCCESS`;
export const FETCH_DEPLOYMENT_ERROR = `${actionsPrefix}/FETCH_DEPLOYMENT_ERROR`;

export function fetchDeployment(id, options = { quiet: false }) {
  return async (dispatch) => {
    let data = {};
    dispatch({ type: FETCH_DEPLOYMENT_REQUEST, data, loading: true });

    try {
      const url = `/api/deployments/${id}`;
      const res = await fetch(url, { method: 'GET', timeout: options.timeout, credentials: 'same-origin' });
      if (res.status >= 400) throw new Error(`${url} returned ${res.status} ${res.statusText}`);
      data = await res.json();
    } catch(error) {
      if (options.quiet !== true) console.error(error); // eslint-disable-line no-console
      return dispatch({ type: FETCH_DEPLOYMENT_ERROR, data, error });
    }

    return dispatch({ type: FETCH_DEPLOYMENT_SUCCESS, data });
  };
}

export default function(state = {}, action)  {
  switch (action.type) {
    case FETCH_DEPLOYMENT_REQUEST:
    case FETCH_DEPLOYMENT_SUCCESS:
    case FETCH_DEPLOYMENT_ERROR: {
      return {
        ...state,
        data: {
          ...action.data,
        },
        meta: {
          error: action.error,
          loading: !!action.loading,
        },
      };
    }
    default: {
      return state;
    }
  }
}
