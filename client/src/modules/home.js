import { createAction, handleActions } from 'redux-actions';

const actionsPrefix = 'KUBERNAUT/HOME';
export const initHomePage = createAction(`${actionsPrefix}/INIT`);

export const fetchReleases = createAction(`${actionsPrefix}/FETCH_RELEASES`);
export const FETCH_RELEASES_REQUEST = createAction(`${actionsPrefix}/FETCH_RELEASES_REQUEST`);
export const FETCH_RELEASES_SUCCESS = createAction(`${actionsPrefix}/FETCH_RELEASES_SUCCESS`);
export const FETCH_RELEASES_ERROR = createAction(`${actionsPrefix}/FETCH_RELEASES_ERROR`);

export const fetchDeployments = createAction(`${actionsPrefix}/FETCH_DEPLOYMENTS`);
export const FETCH_DEPLOYMENTS_REQUEST = createAction(`${actionsPrefix}/FETCH_DEPLOYMENTS_REQUEST`);
export const FETCH_DEPLOYMENTS_SUCCESS = createAction(`${actionsPrefix}/FETCH_DEPLOYMENTS_SUCCESS`);
export const FETCH_DEPLOYMENTS_ERROR = createAction(`${actionsPrefix}/FETCH_DEPLOYMENTS_ERROR`);

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
    meta: {},
  },
};

export default handleActions({
  [FETCH_RELEASES_REQUEST]: (state) => ({
    ...state,
    releases: {
      ...state.releases,
      data: defaultState.releases.data,
    },
  }),
  [FETCH_RELEASES_SUCCESS]: (state, { payload }) => ({
    ...state,
    releases: {
      ...state.releases,
      data: payload.data,
    },
  }),
  [FETCH_RELEASES_ERROR]: (state, { payload }) => ({
    ...state,
    releases: {
      ...state.releases,
      meta: {
        error: payload.error,
      },
    },
  }),
  [FETCH_DEPLOYMENTS_REQUEST]: (state) => ({
    ...state,
    deployments: {
      ...state.deployments,
      data: defaultState.deployments.data,
    },
  }),
  [FETCH_DEPLOYMENTS_SUCCESS]: (state, { payload }) => ({
    ...state,
    deployments: {
      ...state.deployments,
      data: payload.data,
    },
  }),
  [FETCH_DEPLOYMENTS_ERROR]: (state, { payload }) => ({
    ...state,
    deployments: {
      ...state.deployments,
      meta: {
        error: payload.error,
      },
    },
  }),
}, defaultState);
