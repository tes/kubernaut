import {
  fetchReleases,
  fetchDeployments,
} from '../lib/api';
const actionsPrefix = 'KUBERNAUT/SERVICE';
export const FETCH_RELEASES_REQUEST = `${actionsPrefix}/FETCH_RELEASES_REQUEST`;
export const FETCH_RELEASES_SUCCESS = `${actionsPrefix}/FETCH_RELEASES_SUCCESS`;
export const FETCH_RELEASES_ERROR = `${actionsPrefix}/FETCH_RELEASES_ERROR`;

export const FETCH_DEPLOYMENTS_REQUEST = `${actionsPrefix}/FETCH_DEPLOYMENTS_REQUEST`;
export const FETCH_DEPLOYMENTS_SUCCESS = `${actionsPrefix}/FETCH_DEPLOYMENTS_SUCCESS`;
export const FETCH_DEPLOYMENTS_ERROR = `${actionsPrefix}/FETCH_DEPLOYMENTS_ERROR`;

export function fetchDeploymentHistoryForService(options) {
  return async (dispatch) => {
    if (!options.registry) return new Error('provide a registry');
    if (!options.service) return new Error('provide a service');

    const quiet = options.quiet || false;
    const page = options.page || 1;
    const limit = options.limit || 10;
    const offset = (page - 1) * limit;

    let data = { limit, offset, count: 0, items: [] };
    dispatch({ type: FETCH_DEPLOYMENTS_REQUEST, data, loading: true });

    try {
      data = await fetchDeployments({
        registry: options.registry,
        service: options.service,
        page,
        limit,
        offset,
      });
    } catch(error) {
      if (!quiet) console.error(error); // eslint-disable-line no-console
      return dispatch({ type: FETCH_DEPLOYMENTS_ERROR, data, error });
    }

    return dispatch({ type: FETCH_DEPLOYMENTS_SUCCESS, data });
  };
}

export function fetchReleasesForService(options) {
  return async (dispatch) => {
    if (!options.registry) return new Error('provide a registry');
    if (!options.service) return new Error('provide a service');

    const quiet = options.quiet || false;
    const page = options.page || 1;
    const limit = options.limit || 10;
    const offset = (page - 1) * limit;
    let data = { limit, offset, count: 0, items: [] };
    dispatch({ type: FETCH_RELEASES_REQUEST, data, loading: true });

    try {
      data = await fetchReleases({
        registry: options.registry,
        service: options.service,
        page,
        limit,
        offset,
      });
    } catch(error) {
      if (!quiet) console.error(error); // eslint-disable-line no-console
      return dispatch({ type: FETCH_RELEASES_ERROR, data, error });
    }

    return dispatch({ type: FETCH_RELEASES_SUCCESS, data });
  };
}

const defaultState = {
  releases: {
    data: {
      limit: 0,
      offset: 0,
      count: 0,
      pages: 0,
      page: 0,
      items: [],
    },
    meta: {}
  },
  deployments: {
    data: {
      limit: 0,
      offset: 0,
      count: 0,
      pages: 0,
      page: 0,
      items: [],
    },
    meta: {}
  }
};

export default function(oldState, action) {
  const state = oldState ? oldState : defaultState;
  switch (action.type) {
    case FETCH_RELEASES_REQUEST:
    case FETCH_RELEASES_SUCCESS:
    case FETCH_RELEASES_ERROR: {
      return {
        ...state,
        releases: {
          data: {
            ...action.data,
            pages: action.data.limit ? Math.ceil(action.data.count / action.data.limit) : 0,
            page: action.data.limit ? Math.floor(action.data.offset / action.data.limit) + 1 : 0,
          },
          meta: {
            error: action.error,
            loading: !!action.loading,
          },
        },
      };
    }
    case FETCH_DEPLOYMENTS_REQUEST:
    case FETCH_DEPLOYMENTS_SUCCESS:
    case FETCH_DEPLOYMENTS_ERROR: {
      return {
        ...state,
        deployments: {
          data: {
            ...action.data,
            pages: action.data.limit ? Math.ceil(action.data.count / action.data.limit) : 0,
            page: action.data.limit ? Math.floor(action.data.offset / action.data.limit) + 1 : 0,
          },
          meta: {
            error: action.error,
            loading: !!action.loading,
          },
        },
      };
    }
    default: {
      return state;
    }
  }
}
