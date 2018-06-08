const actionsPrefix = 'KUBERNAUT/REGISTRIES';
export const FETCH_REGISTRIES_REQUEST = `${actionsPrefix}/FETCH_REGISTRIES_REQUEST`;
export const FETCH_REGISTRIES_SUCCESS = `${actionsPrefix}/FETCH_REGISTRIES_SUCCESS`;
export const FETCH_REGISTRIES_ERROR = `${actionsPrefix}/FETCH_REGISTRIES_ERROR`;

export function fetchRegistries(options = { page: 1, limit: 50, quiet: false }) {
  return async (dispatch) => {
    const limit = options.limit;
    const offset = (options.page - 1) * options.limit;
    let data = { limit, offset, count: 0, items: [] };
    dispatch({ type: FETCH_REGISTRIES_REQUEST, data, loading: true });

    try {
      const url = `/api/registries?limit=${limit}&offset=${offset}`;
      const res = await fetch(url, { method: 'GET', timeout: options.timeout, credentials: 'same-origin' });
      if (res.status >= 400) throw new Error(`${url} returned ${res.status} ${res.statusText}`);
      data = await res.json();
    } catch(error) {
      if (options.quiet !== true) console.error(error); // eslint-disable-line no-console
      return dispatch({ type: FETCH_REGISTRIES_ERROR, data, error });
    }

    return dispatch({ type: FETCH_REGISTRIES_SUCCESS, data });
  };
}

export default function(state = { data: { limit: 0, offset: 0, count: 0, pages: 0, page: 0, items: [] }, meta: {} }, action)  {
  switch (action.type) {
    case FETCH_REGISTRIES_REQUEST:
    case FETCH_REGISTRIES_SUCCESS:
    case FETCH_REGISTRIES_ERROR: {
      return {
        ...state,
        data: {
          ...action.data,
          pages: action.data.limit ? Math.ceil(action.data.count / action.data.limit) : 0,
          page: action.data.limit ? Math.floor(action.data.offset / action.data.limit) + 1 : 0,
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
