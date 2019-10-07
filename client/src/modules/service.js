import { createAction, handleActions, combineActions } from 'redux-actions';

const actionsPrefix = 'KUBERNAUT/SERVICE';
export const initServiceDetailPage = createAction(`${actionsPrefix}/INIT_SERVICE_DETAIL_PAGE`);

export const fetchReleases = createAction(`${actionsPrefix}/FETCH_RELEASES`);
export const fetchReleasesPagination = createAction(`${actionsPrefix}/FETCH_RELEASES_PAGINATION`);
export const setReleasesPagination = createAction(`${actionsPrefix}/SET_RELEASES_PAGINATION`);
export const FETCH_RELEASES_REQUEST = createAction(`${actionsPrefix}/FETCH_RELEASES_REQUEST`);
export const FETCH_RELEASES_SUCCESS = createAction(`${actionsPrefix}/FETCH_RELEASES_SUCCESS`);
export const FETCH_RELEASES_ERROR = createAction(`${actionsPrefix}/FETCH_RELEASES_ERROR`);

export const fetchDeployments = createAction(`${actionsPrefix}/FETCH_DEPLOYMENTS`);
export const fetchDeploymentsPagination = createAction(`${actionsPrefix}/FETCH_DEPLOYMENTS_PAGINATION`);
export const setDeploymentsPagination = createAction(`${actionsPrefix}/SET_DEPLOYMENTS_PAGINATION`);
export const FETCH_DEPLOYMENTS_REQUEST = createAction(`${actionsPrefix}/FETCH_DEPLOYMENTS_REQUEST`);
export const FETCH_DEPLOYMENTS_SUCCESS = createAction(`${actionsPrefix}/FETCH_DEPLOYMENTS_SUCCESS`);
export const FETCH_DEPLOYMENTS_ERROR = createAction(`${actionsPrefix}/FETCH_DEPLOYMENTS_ERROR`);

export const FETCH_LATEST_DEPLOYMENTS_BY_NAMESPACE_REQUEST = createAction(`${actionsPrefix}/FETCH_LATEST_DEPLOYMENTS_BY_NAMESPACE_REQUEST`);
export const FETCH_LATEST_DEPLOYMENTS_BY_NAMESPACE_SUCCESS = createAction(`${actionsPrefix}/FETCH_LATEST_DEPLOYMENTS_BY_NAMESPACE_SUCCESS`);
export const FETCH_LATEST_DEPLOYMENTS_BY_NAMESPACE_ERROR = createAction(`${actionsPrefix}/FETCH_LATEST_DEPLOYMENTS_BY_NAMESPACE_ERROR`);

export const FETCH_HAS_DEPLOYMENT_NOTES_SUCCESS = createAction(`${actionsPrefix}/FETCH_HAS_DEPLOYMENT_NOTES_SUCCESS`);
export const FETCH_RELEASE_NAMESPACE_HISTORY_SUCCESS = createAction(`${actionsPrefix}/FETCH_RELEASE_NAMESPACE_HISTORY_SUCCESS`);

export const FETCH_TEAM_REQUEST = createAction(`${actionsPrefix}/FETCH_TEAM_REQUEST`);
export const FETCH_TEAM_SUCCESS = createAction(`${actionsPrefix}/FETCH_TEAM_SUCCESS`);

export const fetchTeamForService = createAction(`${actionsPrefix}/FETCH_TEAM_FOR_SERVICE`);

export const setCanManage = createAction(`${actionsPrefix}/SET_CAN_MANAGE`);

export const setCurrentService = createAction(`${actionsPrefix}/SET_CURRENT_SERVICE`);
export const clearCurrentService = createAction(`${actionsPrefix}/CLEAR_CURRENT_SERVICE`);

export const selectCurrentService = (state) => (state.service.service);
export const selectReleasesPaginationState = (state) => (state.service.releases.pagination);
export const selectDeploymentsPaginationState = (state) => (state.service.deployments.pagination);

const defaultPaginationState = {
  page: 1,
  limit: 10,
};
export const releasesDefaultPagination = defaultPaginationState;
export const deploymentsDefaultPagination = defaultPaginationState;

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
    meta: {},
    pagination: releasesDefaultPagination,
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
    pagination: deploymentsDefaultPagination,
  },
  latestDeployments: {
    data: [],
    meta: {},
  },
  deploymentsWithNotes: {
    data: [],
  },
  releasesNamespaceHistory: {
    data: [],
  },
  canManage: false,
  service: {
    registryName: '',
    name: '',
  },
  team: {
    name: '',
  },
};

export default handleActions({
  [setCurrentService]: (state, { payload }) => ({
    ...state,
    service: {
      registryName: payload.registry,
      name: payload.service,
    },
  }),
  [clearCurrentService]: (state) => ({
    ...state,
    service: defaultState.service,
  }),
  [FETCH_RELEASES_REQUEST]: (state) => ({
    ...state,
    releases: {
      ...state.releases,
      data: defaultState.releases.data,
      meta: {
        loading: true,
      },
    },
  }),
  [FETCH_RELEASES_SUCCESS]: (state, { payload }) => ({
    ...state,
    releases: {
      ...state.releases,
      data: payload.data,
      meta: {
        loading: false,
      },
    },
  }),
  [FETCH_RELEASES_ERROR]: (state, { payload }) => ({
    ...state,
    releases: {
      ...state.releases,
      meta: {
        error: payload.error,
        loading: false,
      },
    },
  }),
  [combineActions(fetchReleasesPagination, setReleasesPagination)]: (state, { payload }) => ({
    ...state,
    releases: {
      ...state.releases,
      pagination: {
        page: payload.page || defaultState.releases.pagination.page,
        limit: payload.limit || defaultState.releases.pagination.limit,
      },
    },
  }),
  [FETCH_DEPLOYMENTS_REQUEST]: (state) => ({
    ...state,
    deployments: {
      ...state.deployments,
      data: defaultState.deployments.data,
      meta: {
        loading: true,
      },
    },
  }),
  [FETCH_DEPLOYMENTS_SUCCESS]: (state, { payload }) => ({
    ...state,
    deployments: {
      ...state.deployments,
      data: payload.data,
      meta: {
        loading: false,
      },
    },
  }),
  [FETCH_DEPLOYMENTS_ERROR]: (state, { payload }) => ({
    ...state,
    deployments: {
      ...state.deployments,
      meta: {
        error: payload.error,
        loading: false,
      },
    },
  }),
  [combineActions(fetchDeploymentsPagination, setDeploymentsPagination)]: (state, { payload }) => ({
    ...state,
    deployments: {
      ...state.deployments,
      pagination: {
        page: payload.page || defaultState.deployments.pagination.page,
        limit: payload.limit || defaultState.deployments.pagination.limit,
      },
    },
  }),
  [FETCH_LATEST_DEPLOYMENTS_BY_NAMESPACE_REQUEST]: (state) => ({
    ...state,
    latestDeployments: {
      ...state.latestDeployments,
      data: defaultState.latestDeployments.data,
      meta: {
        loading: true,
      },
    },
  }),
  [FETCH_LATEST_DEPLOYMENTS_BY_NAMESPACE_SUCCESS]: (state, { payload }) => ({
    ...state,
    latestDeployments: {
      ...state.latestDeployments,
      data: payload.data,
      meta: {
        loading: false,
      },
    },
  }),
  [FETCH_LATEST_DEPLOYMENTS_BY_NAMESPACE_ERROR]: (state, { payload }) => ({
    ...state,
    latestDeployments: {
      ...state.latestDeployments,
      meta: {
        error: payload.error,
        loading: false,
      },
    },
  }),
  [FETCH_HAS_DEPLOYMENT_NOTES_SUCCESS]: (state, { payload }) => ({
    ...state,
    deploymentsWithNotes: {
      data: payload.data.items,
    },
  }),
  [FETCH_RELEASE_NAMESPACE_HISTORY_SUCCESS]: (state, { payload }) => ({
    ...state,
    releasesNamespaceHistory: {
      data: payload.data,
    },
  }),
  [initServiceDetailPage]: (state) => ({
    ...state,
    canManage: false,
  }),
  [setCanManage]: (state, { payload }) => ({
    ...state,
    canManage: payload,
  }),
  [FETCH_TEAM_REQUEST]: (state) => ({
    ...state,
    team: defaultState.team,
  }),
  [FETCH_TEAM_SUCCESS]: (state, { payload }) => ({
    ...state,
    team: payload.data,
  }),
}, defaultState);
