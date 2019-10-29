import { createAction, handleActions, combineActions } from 'redux-actions';
import computeLoading from './lib/computeLoading';

const actionsPrefix = 'KUBERNAUT/TEAM';
export const initialiseTeamPage = createAction(`${actionsPrefix}/INITIALISE`);
export const fetchTeamPageData = createAction(`${actionsPrefix}/FETCH_TEAM_PAGE_DATA`);
export const fetchServices = createAction(`${actionsPrefix}/FETCH_SERVICES`);
export const fetchMembers = createAction(`${actionsPrefix}/FETCH_MEMBERS`);
export const fetchServicesPagination = createAction(`${actionsPrefix}/FETCH_SERVICES_PAGINATION`);
export const fetchMembersPagination = createAction(`${actionsPrefix}/FETCH_MEMBERS_PAGINATION`);

export const FETCH_TEAM_REQUEST = createAction(`${actionsPrefix}/FETCH_TEAM_REQUEST`);
export const FETCH_TEAM_SUCCESS = createAction(`${actionsPrefix}/FETCH_TEAM_SUCCESS`);
export const FETCH_TEAM_ERROR = createAction(`${actionsPrefix}/FETCH_TEAM_ERROR`);
export const FETCH_TEAM_SERVICES_REQUEST = createAction(`${actionsPrefix}/FETCH_TEAM_SERVICES_REQUEST`);
export const FETCH_TEAM_SERVICES_SUCCESS = createAction(`${actionsPrefix}/FETCH_TEAM_SERVICES_SUCCESS`);
export const FETCH_TEAM_SERVICES_ERROR = createAction(`${actionsPrefix}/FETCH_TEAM_SERVICES_ERROR`);
export const FETCH_TEAM_MEMBERS_REQUEST = createAction(`${actionsPrefix}/FETCH_TEAM_MEMBERS_REQUEST`);
export const FETCH_TEAM_MEMBERS_SUCCESS = createAction(`${actionsPrefix}/FETCH_TEAM_MEMBERS_SUCCESS`);
export const FETCH_TEAM_MEMBERS_ERROR = createAction(`${actionsPrefix}/FETCH_TEAM_MEMBERS_ERROR`);

export const setCanEdit = createAction(`${actionsPrefix}/SET_CAN_EDIT`);
export const setPagination = createAction(`${actionsPrefix}/SET_PAGINATION`);
export const setMembersPagination = createAction(`${actionsPrefix}/SET_MEMBERS_PAGINATION`);

export const selectTeam = (state) => (state.team.team.data);
export const selectPaginationState = (state) => (state.team.services.pagination);
export const selectMembersPaginationState = (state) => (state.team.members.pagination);

const defaultState = {
  meta: {
    loading: {
      sections: {
        team: false,
        services: false,
        members: false,
      },
      loadingPercent: 100,
    },
  },
  team: {
    data: {
      name: '',
      attributes: {},
    },
  },
  services: {
    data: {
      limit: 0,
      offset: 0,
      count: 0,
      pages: 0,
      page: 0,
      items: [],
    },
    pagination: {
      page: 1,
      limit: 20,
    },
  },
  members: {
    data: {
      limit: 0,
      offset: 0,
      count: 0,
      pages: 0,
      page: 0,
      items: [],
    },
    pagination: {
      page: 1,
      limit: 20,
    },
  },
  canEdit: false,
};

export default handleActions({
  [fetchTeamPageData]: () => ({
    ...defaultState,
  }),
  [FETCH_TEAM_REQUEST]: (state) => ({
    ...state,
    meta: {
      loading: computeLoading(state.meta.loading, 'team', true),
    },
    team: {
      ...state.team,
    },
  }),
  [FETCH_TEAM_SUCCESS]: (state, { payload }) => ({
    ...state,
    meta: {
      loading: computeLoading(state.meta.loading, 'team', false),
    },
    team: {
      ...state.team,
      data: payload.data,
    },
  }),
  [FETCH_TEAM_ERROR]: (state, { payload }) => ({
    ...state,
    meta: {
      loading: computeLoading(state.meta.loading, 'team', false),
    },
    team: {
      ...state.team,
    },
  }),
  [setCanEdit]: (state, { payload }) => ({
    ...state,
    canEdit: payload,
  }),
  [FETCH_TEAM_SERVICES_REQUEST]: (state) => ({
    ...state,
    meta: {
      loading: computeLoading(state.meta.loading, 'services', true),
    },
  }),
  [FETCH_TEAM_SERVICES_SUCCESS]: (state, { payload }) => ({
    ...state,
    meta: {
      loading: computeLoading(state.meta.loading, 'services', false),
    },
    services: {
      ...state.services,
      data: payload.data,
    },
  }),
  [FETCH_TEAM_SERVICES_ERROR]: (state, { payload }) => ({
    ...state,
    meta: {
      loading: computeLoading(state.meta.loading, 'services', false),
    },
    services: {
      ...state.services,
    },
  }),
  [combineActions(fetchServicesPagination, setPagination)]: (state, { payload }) => ({
    ...state,
    services: {
      ...state.services,
      pagination: {
        page: payload.page || defaultState.services.pagination.page,
        limit: payload.limit || defaultState.services.pagination.limit,
      },
    },
  }),
  [FETCH_TEAM_MEMBERS_REQUEST]: (state) => ({
    ...state,
    meta: {
      loading: computeLoading(state.meta.loading, 'members', true),
    },
  }),
  [FETCH_TEAM_MEMBERS_SUCCESS]: (state, { payload }) => ({
    ...state,
    meta: {
      loading: computeLoading(state.meta.loading, 'members', false),
    },
    members: {
      ...state.members,
      data: payload.data,
    },
  }),
  [FETCH_TEAM_MEMBERS_ERROR]: (state, { payload }) => ({
    ...state,
    meta: {
      loading: computeLoading(state.meta.loading, 'members', false),
    },
    members: {
      ...state.members,
    },
  }),
  [combineActions(fetchMembersPagination, setMembersPagination)]: (state, { payload }) => ({
    ...state,
    members: {
      ...state.members,
      pagination: {
        page: payload.page || defaultState.members.pagination.page,
        limit: payload.limit || defaultState.members.pagination.limit,
      },
    },
  }),
}, defaultState);
