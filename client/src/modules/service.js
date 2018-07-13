import { createAction, combineActions, handleActions } from 'redux-actions';
import {
  fetchReleases,
  getDeployments,
  fetchLatestDeploymentsByNamespaceForService,
} from '../lib/api';
const actionsPrefix = 'KUBERNAUT/SERVICE';
export const FETCH_RELEASES_REQUEST = createAction(`${actionsPrefix}/FETCH_RELEASES_REQUEST`);
export const FETCH_RELEASES_SUCCESS = createAction(`${actionsPrefix}/FETCH_RELEASES_SUCCESS`);
export const FETCH_RELEASES_ERROR = createAction(`${actionsPrefix}/FETCH_RELEASES_ERROR`);

export const FETCH_DEPLOYMENTS_REQUEST = createAction(`${actionsPrefix}/FETCH_DEPLOYMENTS_REQUEST`);
export const FETCH_DEPLOYMENTS_SUCCESS = createAction(`${actionsPrefix}/FETCH_DEPLOYMENTS_SUCCESS`);
export const FETCH_DEPLOYMENTS_ERROR = createAction(`${actionsPrefix}/FETCH_DEPLOYMENTS_ERROR`);

export const FETCH_LATEST_DEPLOYMENTS_BY_NAMESPACE_REQUEST = createAction(`${actionsPrefix}/FETCH_LATEST_DEPLOYMENTS_BY_NAMESPACE_REQUEST`);
export const FETCH_LATEST_DEPLOYMENTS_BY_NAMESPACE_SUCCESS = createAction(`${actionsPrefix}/FETCH_LATEST_DEPLOYMENTS_BY_NAMESPACE_SUCCESS`);
export const FETCH_LATEST_DEPLOYMENTS_BY_NAMESPACE_ERROR = createAction(`${actionsPrefix}/FETCH_LATEST_DEPLOYMENTS_BY_NAMESPACE_ERROR`);

export function fetchDeploymentHistoryForService(options) {
  return async (dispatch) => {
    if (!options.registry) return new Error('provide a registry');
    if (!options.service) return new Error('provide a service');

    const quiet = options.quiet || false;
    const page = options.page || 1;
    const limit = options.limit || 10;
    const offset = (page - 1) * limit;

    let data = { limit, offset, count: 0, items: [] };
    dispatch(FETCH_DEPLOYMENTS_REQUEST({ data, loading: true }));

    try {
      data = await getDeployments({
        registry: options.registry,
        service: options.service,
        page,
        limit,
        offset,
      });
    } catch(error) {
      if (!quiet) console.error(error); // eslint-disable-line no-console
      return dispatch(FETCH_DEPLOYMENTS_ERROR({ data, error }));
    }

    return dispatch(FETCH_DEPLOYMENTS_SUCCESS({ data }));
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
    dispatch(FETCH_RELEASES_REQUEST({ data, loading: true }));

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
      return dispatch(FETCH_RELEASES_ERROR({ data, error }));
    }

    return dispatch(FETCH_RELEASES_SUCCESS({ data }));
  };
}

export function fetchLatestDeploymentsByNamespace(options) {
  return async (dispatch) => {
    if (!options.registry) return new Error('provide a registry');
    if (!options.service) return new Error('provide a service');

    const quiet = options.quiet || false;
    let data = [];
    dispatch(FETCH_LATEST_DEPLOYMENTS_BY_NAMESPACE_REQUEST({ data, loading: true }));

    try {
      data = await fetchLatestDeploymentsByNamespaceForService({
        registry: options.registry,
        service: options.service,
      });
    } catch(error) {
      if (!quiet) console.error(error); // eslint-disable-line no-console
      return dispatch(FETCH_LATEST_DEPLOYMENTS_BY_NAMESPACE_ERROR({ data, error }));
    }

    return dispatch(FETCH_LATEST_DEPLOYMENTS_BY_NAMESPACE_SUCCESS({ data }));
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
  },
  latestDeployments: {
    data: [],
    meta: {},
  }
};

export default handleActions({
  [combineActions(FETCH_RELEASES_REQUEST, FETCH_RELEASES_SUCCESS, FETCH_RELEASES_ERROR)]: (state, { payload }) => ({
    ...state,
    releases: {
      data: {
        ...payload.data,
        pages: payload.data.limit ? Math.ceil(payload.data.count / payload.data.limit) : 0,
        page: payload.data.limit ? Math.floor(payload.data.offset / payload.data.limit) + 1 : 0,
      },
      meta: {
        error: payload.error,
        loading: !!payload.loading,
      },
    },
  }),
  [combineActions(FETCH_DEPLOYMENTS_REQUEST, FETCH_DEPLOYMENTS_SUCCESS, FETCH_DEPLOYMENTS_ERROR)]: (state, { payload }) => ({
    ...state,
    deployments: {
      data: {
        ...payload.data,
        pages: payload.data.limit ? Math.ceil(payload.data.count / payload.data.limit) : 0,
        page: payload.data.limit ? Math.floor(payload.data.offset / payload.data.limit) + 1 : 0,
      },
      meta: {
        error: payload.error,
        loading: !!payload.loading,
      },
    },
  }),
  [combineActions(FETCH_LATEST_DEPLOYMENTS_BY_NAMESPACE_REQUEST, FETCH_LATEST_DEPLOYMENTS_BY_NAMESPACE_SUCCESS, FETCH_LATEST_DEPLOYMENTS_BY_NAMESPACE_ERROR)]: (state, { payload }) => ({
    ...state,
    latestDeployments: {
      data: payload.data,
      meta: {
        error: payload.error,
        loading: !!payload.loading,
      },
    },
  }),
}, defaultState);
