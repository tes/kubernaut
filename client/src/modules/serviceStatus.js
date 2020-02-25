import { createAction, handleActions } from 'redux-actions';
import computeLoading from './lib/computeLoading';
const actionsPrefix = 'KUBERNAUT/SERVICE_STATUS';
export const initServiceStatusPage = createAction(`${actionsPrefix}/INIT_SERVICE_STATUS_PAGE`);

export const FETCH_LATEST_DEPLOYMENTS_BY_NAMESPACE_REQUEST = createAction(`${actionsPrefix}/FETCH_LATEST_DEPLOYMENTS_BY_NAMESPACE_REQUEST`);
export const FETCH_LATEST_DEPLOYMENTS_BY_NAMESPACE_SUCCESS = createAction(`${actionsPrefix}/FETCH_LATEST_DEPLOYMENTS_BY_NAMESPACE_SUCCESS`);
export const FETCH_LATEST_DEPLOYMENTS_BY_NAMESPACE_ERROR = createAction(`${actionsPrefix}/FETCH_LATEST_DEPLOYMENTS_BY_NAMESPACE_ERROR`);

export const FETCH_STATUS_REQUEST = createAction(`${actionsPrefix}/FETCH_STATUS_REQUEST`);
export const FETCH_STATUS_SUCCESS = createAction(`${actionsPrefix}/FETCH_STATUS_SUCCESS`);
export const FETCH_STATUS_ERROR = createAction(`${actionsPrefix}/FETCH_STATUS_ERROR`);

export const FETCH_TEAM_REQUEST = createAction(`${actionsPrefix}/FETCH_TEAM_REQUEST`);
export const FETCH_TEAM_SUCCESS = createAction(`${actionsPrefix}/FETCH_TEAM_SUCCESS`);

export const fetchLatestDeployments = createAction(`${actionsPrefix}/FETCH_LATEST_DEPLOYMENTS`);
export const fetchStatus = createAction(`${actionsPrefix}/FETCH_STATUS`);
export const fetchTeamForService = createAction(`${actionsPrefix}/FETCH_TEAM_FOR_SERVICE`);
export const changeToNamespace = createAction(`${actionsPrefix}/CHANGE_TO_NAMESPACE`);
export const setCanManage = createAction(`${actionsPrefix}/SET_CAN_MANAGE`);

export const selectLatestDeployments = (state) => (state.serviceStatus.latestDeployments.data);

const defaultState = {
  meta: {
    loading: {
      sections: {
        namespaces: false,
        status: false,
      },
      loadingPercent: 100,
    },
  },
  latestDeployments: {
    data: [],
    meta: {},
  },
  status: [],
  canManage: false,
  team: {
    name: '',
  },
  initialValues: {},
};

export default handleActions({
  [FETCH_LATEST_DEPLOYMENTS_BY_NAMESPACE_REQUEST]: (state) => ({
    ...state,
    latestDeployments: {
      ...state.latestDeployments,
      data: defaultState.latestDeployments.data,
    },
    meta: {
      ...state.meta,
      loading: computeLoading(state.meta.loading, 'namespaces', true),
    },
  }),
  [FETCH_LATEST_DEPLOYMENTS_BY_NAMESPACE_SUCCESS]: (state, { payload }) => ({
    ...state,
    latestDeployments: {
      ...state.latestDeployments,
      data: payload.data.map(d => (d.namespace)),
    },
    meta: {
      ...state.meta,
      loading: computeLoading(state.meta.loading, 'namespaces', false),
    },
  }),
  [FETCH_LATEST_DEPLOYMENTS_BY_NAMESPACE_ERROR]: (state, { payload }) => ({
    ...state,
    latestDeployments: {
      ...state.latestDeployments,
      meta: {
        error: payload.error,
      },
    },
    meta: {
      ...state.meta,
      loading: computeLoading(state.meta.loading, 'namespaces', false),
    },
  }),
  [FETCH_STATUS_REQUEST]: (state) => ({
    ...state,
    status: defaultState.status,
    meta: {
      ...state.meta,
      loading: computeLoading(state.meta.loading, 'status', true),
    },
  }),
  [FETCH_STATUS_SUCCESS]: (state, { payload }) => ({
    ...state,
    status: payload.data.sort((a,b) => (b.createdAt - a.createdAt)).reverse(),
    meta: {
      ...state.meta,
      loading: computeLoading(state.meta.loading, 'status', false),
    },
  }),
  [FETCH_STATUS_ERROR]: (state, { payload }) => ({
    ...state,
    status: defaultState.status,
    meta: {
      ...state.meta,
      loading: computeLoading(state.meta.loading, 'status', false),
    },
  }),
  [initServiceStatusPage]: (state) => ({
    ...defaultState,
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
  [fetchStatus]: (state, { payload }) => ({
    ...state,
    initialValues: {
      ...state.initialValues,
      namespace: payload.namespaceId,
    }
  })
}, defaultState);
