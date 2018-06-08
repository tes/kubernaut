const actionsPrefix = 'KUBERNAUT/RELEASES';
export const FETCH_RELEASES_REQUEST = `${actionsPrefix}/FETCH_RELEASES_REQUEST`;
export const FETCH_RELEASES_SUCCESS = `${actionsPrefix}/FETCH_RELEASES_SUCCESS`;
export const FETCH_RELEASES_ERROR = `${actionsPrefix}/FETCH_RELEASES_ERROR`;

export function fetchReleases({ criteria, limit, pages, page, quiet = false, timeout }) {
  return async (dispatch) => {
    const offset = (page - 1) * limit;
    const data = { criteria, limit, offset, count: 0, items: [] };
    dispatch({ type: FETCH_RELEASES_REQUEST, data, loading: true });

    try {
      const url = getReleasesUrl(criteria, limit, offset);
      const res = await fetch(url, { method: 'GET', timeout: timeout, credentials: 'same-origin' });
      if (res.status >= 400) throw new Error(`${url} returned ${res.status} ${res.statusText}`);
      const payload = await res.json();
      return dispatch({ type: FETCH_RELEASES_SUCCESS, data: { ...data, ...payload } });
    } catch(error) {
      if (!quiet) console.error(error); // eslint-disable-line no-console
      return dispatch({ type: FETCH_RELEASES_ERROR, data, error });
    }
  };
}

function getReleasesUrl(criteria, limit, offset) {
  return Object.keys(criteria.terms).reduce((url, name) => {
    const params = criteria.terms[name].map((value) => `${name}[]=${value}`).join('&');
    return `${url}&${params}`;
  }, `/api/releases?limit=${limit}&offset=${offset}`);
}

export default function(state = { data: { criteria: { source: '', terms: {} }, limit: 20, offset: 0, count: 0, pages: 0, page: 1, items: [] }, meta: {} }, action)  {
  switch (action.type) {
    case FETCH_RELEASES_REQUEST:
    case FETCH_RELEASES_SUCCESS:
    case FETCH_RELEASES_ERROR: {
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
