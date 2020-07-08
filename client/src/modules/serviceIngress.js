import { createAction, handleActions, combineActions } from 'redux-actions';
import computeLoading from './lib/computeLoading';

const actionsPrefix = 'KUBERNAUT/SERVICE_INGRESS';
export const initIngressPage = createAction(`${actionsPrefix}/INITIALISE`);

export const FETCH_SERVICE_REQUEST = createAction(`${actionsPrefix}/FETCH_SERVICE_REQUEST`);
export const FETCH_SERVICE_SUCCESS = createAction(`${actionsPrefix}/FETCH_SERVICE_SUCCESS`);
export const FETCH_SERVICE_ERROR = createAction(`${actionsPrefix}/FETCH_SERVICE_ERROR`);

export const FETCH_TEAM_REQUEST = createAction(`${actionsPrefix}/FETCH_TEAM_REQUEST`);
export const FETCH_TEAM_SUCCESS = createAction(`${actionsPrefix}/FETCH_TEAM_SUCCESS`);
export const FETCH_TEAM_ERROR = createAction(`${actionsPrefix}/FETCH_TEAM_ERROR`);

export const FETCH_INGRESS_VERSIONS_REQUEST = createAction(`${actionsPrefix}/FETCH_INGRESS_VERSIONS_REQUEST`);
export const FETCH_INGRESS_VERSIONS_SUCCESS = createAction(`${actionsPrefix}/FETCH_INGRESS_VERSIONS_SUCCESS`);
export const FETCH_INGRESS_VERSIONS_ERROR = createAction(`${actionsPrefix}/FETCH_INGRESS_VERSIONS_ERROR`);
export const FETCH_INGRESS_VERSION_REQUEST = createAction(`${actionsPrefix}/FETCH_INGRESS_VERSION_REQUEST`);
export const FETCH_INGRESS_VERSION_SUCCESS = createAction(`${actionsPrefix}/FETCH_INGRESS_VERSION_SUCCESS`);
export const FETCH_INGRESS_VERSION_ERROR = createAction(`${actionsPrefix}/FETCH_INGRESS_VERSION_ERROR`);

export const canManageRequest = createAction(`${actionsPrefix}/CAN_MANAGE_REQUEST`);
export const setCanManage = createAction(`${actionsPrefix}/SET_CAN_MANAGE`);
export const canReadIngressRequest = createAction(`${actionsPrefix}/CAN_READ_INGRESS_REQUEST`);
export const canWriteIngressRequest = createAction(`${actionsPrefix}/CAN_WRITE_INGRESS_REQUEST`);
export const setCanWriteIngress = createAction(`${actionsPrefix}/SET_CAN_WRITE_INGRESS`);
export const setCanReadIngress = createAction(`${actionsPrefix}/SET_CAN_READ_INGRESS`);
export const fetchVersionsPagination = createAction(`${actionsPrefix}/FETCH_VERSIONS_PAGINATION`);
export const setPagination = createAction(`${actionsPrefix}/SET_PAGINATION`);
export const fetchVersions = createAction(`${actionsPrefix}/FETCH_VERSIONS`);
export const fetchVersion = createAction(`${actionsPrefix}/FETCH_VERSION`);

export const selectPaginationState = (state) => (state.serviceIngress.pagination);
export const selectService = (state) => state.serviceIngress.service;

const defaultState = {
  meta: {
    loading: {
      sections: {
        service: false,
        canManage: false,
        team: false,
        canReadIngress: false,
        canWriteIngress: false,
        versions: false,
        version: false,
      },
      loadingPercent: 100,
    },
  },
  service: {
    id: '',
    name: '',
    registry: {
      name: '',
    },
  },
  team: {
    name: '',
  },
  canManage: false,
  canReadIngress: false,
  canWriteIngress: false,
  pagination: {
    page: 1,
    limit: 10,
  },
  versions: {
    limit: 0,
    offset: 0,
    count: 0,
    pages: 0,
    page: 0,
    items: [],
  },
  version: {
    id: '',
    comment: '',
    entries: [],
  },
};


export default handleActions({
  [initIngressPage]: () => ({
    ...defaultState,
  }),
  [FETCH_SERVICE_REQUEST]: (state) => ({
    ...state,
    meta: {
      ...state.meta,
      loading: computeLoading(state.meta.loading, 'service', true),
    },
  }),
  [FETCH_SERVICE_SUCCESS]: (state, { payload: { data } }) => ({
    ...state,
    meta: {
      ...state.meta,
      loading: computeLoading(state.meta.loading, 'service', false),
    },
    service: data,
  }),
  [FETCH_SERVICE_ERROR]: (state, { payload }) => ({
    ...state,
    meta: {
      ...state.meta,
      loading: computeLoading(state.meta.loading, 'service', false),
      error: payload.error,
    },
  }),
  [canManageRequest]: (state) => ({
    ...state,
    meta: {
      ...state.meta,
      loading: computeLoading(state.meta.loading, 'canManage', true),
    }
  }),
  [setCanManage]: (state, { payload }) => ({
    ...state,
    canManage: payload,
    meta: {
      ...state.meta,
      loading: computeLoading(state.meta.loading, 'canManage', false),
    },
  }),
  [canWriteIngressRequest]: (state) => ({
    ...state,
    meta: {
      ...state.meta,
      loading: computeLoading(state.meta.loading, 'canWriteIngress', true),
    }
  }),
  [setCanWriteIngress]: (state, { payload }) => ({
    ...state,
    canWriteIngress: payload,
    meta: {
      ...state.meta,
      loading: computeLoading(state.meta.loading, 'canWriteIngress', false),
    },
  }),
  [canReadIngressRequest]: (state) => ({
    ...state,
    meta: {
      ...state.meta,
      loading: computeLoading(state.meta.loading, 'canReadIngress', true),
    }
  }),
  [setCanReadIngress]: (state, { payload }) => ({
    ...state,
    canReadIngress: payload,
    meta: {
      ...state.meta,
      loading: computeLoading(state.meta.loading, 'canReadIngress', false),
    },
  }),
  [FETCH_TEAM_REQUEST]: (state) => ({
    ...state,
    team: defaultState.team,
    meta: {
      ...state.meta,
      loading: computeLoading(state.meta.loading, 'team', true),
    },
  }),
  [FETCH_TEAM_SUCCESS]: (state, { payload }) => ({
    ...state,
    team: payload.data,
    meta: {
      ...state.meta,
      loading: computeLoading(state.meta.loading, 'team', false),
    },
  }),
  [FETCH_TEAM_ERROR]: (state, { payload }) => ({
    ...state,
    team: defaultState.team,
    meta: {
      ...state.meta,
      loading: computeLoading(state.meta.loading, 'team', false),
    },
  }),
  [FETCH_INGRESS_VERSIONS_REQUEST]: (state, { payload }) => ({
    ...state,
    meta: {
      loading: computeLoading(state.meta.loading, 'versions', true),
    },
  }),
  [FETCH_INGRESS_VERSIONS_SUCCESS]: (state, { payload }) => ({
    ...state,
    meta: {
      loading: computeLoading(state.meta.loading, 'versions', false),
    },
    versions: payload.data,
  }),
  [FETCH_INGRESS_VERSIONS_ERROR]: (state, { payload }) => ({
    ...state,
    meta: {
      loading: computeLoading(state.meta.loading, 'versions', false),
    },
  }),
  [FETCH_INGRESS_VERSION_REQUEST]: (state, { payload }) => ({
    ...state,
    meta: {
      loading: computeLoading(state.meta.loading, 'version', true),
    },
  }),
  [FETCH_INGRESS_VERSION_SUCCESS]: (state, { payload }) => ({
    ...state,
    meta: {
      loading: computeLoading(state.meta.loading, 'version', false),
    },
    version: payload.data,
  }),
  [FETCH_INGRESS_VERSION_ERROR]: (state, { payload }) => ({
    ...state,
    meta: {
      loading: computeLoading(state.meta.loading, 'version', false),
    },
  }),
  [combineActions(fetchVersionsPagination, setPagination)]: (state, { payload }) => ({
    ...state,
    pagination: {
      page: payload.page || defaultState.pagination.page,
      limit: payload.limit || defaultState.pagination.limit,
    },
  }),
}, defaultState);
