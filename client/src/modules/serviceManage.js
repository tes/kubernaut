import { createAction, handleActions, combineActions } from 'redux-actions';
import computeLoading from './lib/computeLoading';
const actionsPrefix = 'KUBERNAUT/SERVICE_MANAGE';
export const initServiceManage = createAction(`${actionsPrefix}/INITIALISE`);
export const updateServiceStatusForNamespace = createAction(`${actionsPrefix}/UPDATE_SERVICE_STATUS`);
export const updateServiceStatusSuccess = createAction(`${actionsPrefix}/UPDATE_SERVICE_STATUS_SUCCESS`);
export const fetchServices = createAction(`${actionsPrefix}/FETCH_SERVICES`);
export const fetchNamespacesPagination = createAction(`${actionsPrefix}/FETCH_NAMESPACES_PAGINATION`);
export const setPagination = createAction(`${actionsPrefix}/SET_PAGINATION`);
export const canManageRequest = createAction(`${actionsPrefix}/CAN_MANAGE_REQUEST`);
export const canDeleteRequest = createAction(`${actionsPrefix}/CAN_DELETE_REQUEST`);
export const canReadIngressRequest = createAction(`${actionsPrefix}/CAN_READ_INGRESS_REQUEST`);
export const setCanManage = createAction(`${actionsPrefix}/SET_CAN_MANAGE`);
export const setCanReadIngress = createAction(`${actionsPrefix}/SET_CAN_READ_INGRESS`);
export const FETCH_SERVICE_REQUEST = createAction(`${actionsPrefix}/FETCH_SERVICE_REQUEST`);
export const FETCH_SERVICE_SUCCESS = createAction(`${actionsPrefix}/FETCH_SERVICE_SUCCESS`);
export const FETCH_SERVICE_ERROR = createAction(`${actionsPrefix}/FETCH_SERVICE_ERROR`);
export const FETCH_SERVICE_NAMESPACES_STATUS_REQUEST = createAction(`${actionsPrefix}/FETCH_SERVICE_NAMESPACES_STATUS_REQUEST`);
export const FETCH_SERVICE_NAMESPACES_STATUS_SUCCESS = createAction(`${actionsPrefix}/FETCH_SERVICE_NAMESPACES_STATUS_SUCCESS`);
export const FETCH_SERVICE_NAMESPACES_STATUS_ERROR = createAction(`${actionsPrefix}/FETCH_SERVICE_NAMESPACES_STATUS_ERROR`);
export const FETCH_TEAM_REQUEST = createAction(`${actionsPrefix}/FETCH_TEAM_REQUEST`);
export const FETCH_TEAM_SUCCESS = createAction(`${actionsPrefix}/FETCH_TEAM_SUCCESS`);
export const FETCH_TEAM_ERROR = createAction(`${actionsPrefix}/FETCH_TEAM_ERROR`);
export const fetchTeamForService = createAction(`${actionsPrefix}/FETCH_TEAM_FOR_SERVICE`);
export const setCanManageTeamForService = createAction(`${actionsPrefix}/SET_CAN_MANAGE_TEAM_FOR_SERVICE`);
export const setManageableTeams = createAction(`${actionsPrefix}/SET_MANAGEABLE_TEAMS`);
export const updateTeamOwnership = createAction(`${actionsPrefix}/UPDATE_TEAM_OWNERSHIP`);
export const setCanDelete = createAction(`${actionsPrefix}/SET_CAN_DELETE`);
export const deleteService = createAction(`${actionsPrefix}/DELETE_SERVICE`);
export const openDeleteModal = createAction(`${actionsPrefix}/OPEN_DELETE_MODAL`);
export const closeDeleteModal = createAction(`${actionsPrefix}/CLOSE_DELETE_MODAL`);

export const selectNamespaces = (state) => (state.serviceManage.namespaces);
export const selectPaginationState = (state) => (state.serviceManage.pagination);
export const selectTeam = (state) => (state.serviceManage.team);
export const selectServiceInfo = (state) => ({
  id: state.serviceManage.id,
  registry: state.serviceManage.registry,
  service: state.serviceManage.serviceName,
});

const defaultState = {
  meta: {
    loading: {
      sections: {
        service: false,
        namespaces: false,
        canManage: false,
        canDelete: false,
        canReadIngress: false,
        team: false,
      },
      loadingPercent: 100,
    },
  },
  namespaces: {
    count: 0,
    limit: 0,
    pages: 0,
    page: 0,
    items: [],
    deployable: [],
  },
  pagination: {
    page: 1,
    limit: 10,
  },
  canManage: false,
  canDelete: false,
  canManageTeamForService: false,
  canReadIngress: false,
  initialValues: {},
  id: '',
  registry: '',
  serviceName: '',
  team: {
    name: '',
  },
  manageableTeams: [],
  deleteModalOpen: false,
};

export default handleActions({
  [initServiceManage]: () => ({
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
    id: data.id,
    registry: data.registry.name,
    serviceName: data.name,
  }),
  [FETCH_SERVICE_ERROR]: (state, { payload }) => ({
    ...state,
    meta: {
      ...state.meta,
      loading: computeLoading(state.meta.loading, 'service', false),
      error: payload.error,
    },
  }),
  [FETCH_SERVICE_NAMESPACES_STATUS_REQUEST]: (state) => ({
    ...state,
    namespaces: defaultState.namespaces,
    meta: {
      ...state.meta,
      loading: computeLoading(state.meta.loading, 'namespaces', true),
    },
  }),
  [FETCH_SERVICE_NAMESPACES_STATUS_SUCCESS]: (state, { payload }) => ({
    ...state,
    namespaces: payload.data,
    initialValues: {
      ...state.initialValues,
      deployable: payload.data.deployable,
      namespaces: payload.data.items,
    },
    meta: {
      ...state.meta,
      loading: computeLoading(state.meta.loading, 'namespaces', false),
    },
  }),
  [FETCH_SERVICE_NAMESPACES_STATUS_ERROR]: (state, { payload }) => ({
    ...state,
    meta: {
      ...state.meta,
      loading: computeLoading(state.meta.loading, 'namespaces', false),
      error: payload.error,
    },
  }),
  [updateServiceStatusSuccess]: (state, { payload }) => ({
    ...state,
    namespaces: payload.data,
    initialValues: {
      ...state.initialValues,
      deployable: payload.data.deployable,
      namespaces: payload.data.items,
    },
  }),
  [combineActions(fetchNamespacesPagination, setPagination)]: (state, { payload }) => ({
    ...state,
    pagination: {
      page: payload.page || defaultState.pagination.page,
      limit: payload.limit || defaultState.pagination.limit,
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
  [canDeleteRequest]: (state) => ({
    ...state,
    meta: {
      ...state.meta,
      loading: computeLoading(state.meta.loading, 'canDelete', true),
    }
  }),
  [setCanDelete]: (state, { payload }) => ({
    ...state,
    canDelete: payload,
    meta: {
      ...state.meta,
      loading: computeLoading(state.meta.loading, 'canDelete', false),
    },
  }),
  [FETCH_TEAM_REQUEST]: (state) => ({
    ...state,
    team: defaultState.team,
    canManageTeamForService: defaultState.canManageTeamForService,
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
    canManageTeamForService: defaultState.canManageTeamForService,
    meta: {
      ...state.meta,
      loading: computeLoading(state.meta.loading, 'team', false),
    },
  }),
  [setCanManageTeamForService]: (state, { payload }) => ({
    ...state,
    canManageTeamForService: payload,
  }),
  [setManageableTeams]: (state, { payload }) => ({
    ...state,
    manageableTeams: payload,
    initialValues: {
      ...state.initialValues,
      team: state.team.id,
    }
  }),
  [openDeleteModal]: (state) => ({
    ...state,
    deleteModalOpen: true,
  }),
  [closeDeleteModal]: (state) => ({
    ...state,
    deleteModalOpen: false,
  }),
}, defaultState);
