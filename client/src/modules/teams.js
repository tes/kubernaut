import { createAction, handleActions, combineActions } from 'redux-actions';
import computeLoading from './lib/computeLoading';

const actionsPrefix = 'KUBERNAUT/TEAMS';
export const initialiseTeamsPage = createAction(`${actionsPrefix}/INITIALISE`);

export const fetchTeams = createAction(`${actionsPrefix}/FETCH_TEAMS`);
export const fetchServices = createAction(`${actionsPrefix}/FETCH_SERVICES`);
export const fetchAccounts = createAction(`${actionsPrefix}/FETCH_ACCOUNTS`);

export const fetchTeamsPagination = createAction(`${actionsPrefix}/FETCH_TEAMS_PAGINATION`);
export const fetchServicesPagination = createAction(`${actionsPrefix}/FETCH_SERVICES_PAGINATION`);
export const fetchAccountsPagination = createAction(`${actionsPrefix}/FETCH_ACCOUNTS_PAGINATION`);

export const FETCH_TEAMS_REQUEST = createAction(`${actionsPrefix}/FETCH_TEAMS_REQUEST`);
export const FETCH_TEAMS_SUCCESS = createAction(`${actionsPrefix}/FETCH_TEAMS_SUCCESS`);
export const FETCH_TEAMS_ERROR = createAction(`${actionsPrefix}/FETCH_TEAMS_ERROR`);
export const FETCH_SERVICES_REQUEST = createAction(`${actionsPrefix}/FETCH_SERVICES_REQUEST`);
export const FETCH_SERVICES_SUCCESS = createAction(`${actionsPrefix}/FETCH_SERVICES_SUCCESS`);
export const FETCH_SERVICES_ERROR = createAction(`${actionsPrefix}/FETCH_SERVICES_ERROR`);
export const FETCH_ACCOUNTS_REQUEST = createAction(`${actionsPrefix}/FETCH_ACCOUNTS_REQUEST`);
export const FETCH_ACCOUNTS_SUCCESS = createAction(`${actionsPrefix}/FETCH_ACCOUNTS_SUCCESS`);
export const FETCH_ACCOUNTS_ERROR = createAction(`${actionsPrefix}/FETCH_ACCOUNTS_ERROR`);

export const setTeamsPagination = createAction(`${actionsPrefix}/SET_PAGINATION`);
export const setServicesPagination = createAction(`${actionsPrefix}/SET_SERVICES_PAGINATION`);
export const setAccountsPagination = createAction(`${actionsPrefix}/SET_ACCOUNTS_PAGINATION`);

export const selectTeamsPaginationState = (state) => (state.teams.teams.pagination);
export const selectServicesPaginationState = (state) => (state.teams.services.pagination);
export const selectAccountsPaginationState = (state) => (state.teams.accounts.pagination);

const defaultState = {
  teams: {
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
      limit: 15,
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
      limit: 10,
    },
  },
  accounts: {
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
      limit: 10,
    },
  },
  meta: {
    loading: {
      sections: {
        teams: false,
        services: false,
        accounts: false,
      },
      loadingPercent: 100,
    },
  },
};

export default handleActions({
  [initialiseTeamsPage]: () => ({
    ...defaultState,
  }),
  [FETCH_TEAMS_REQUEST]: (state) => ({
    ...state,
    meta: {
      loading: computeLoading(state.meta.loading, 'teams', true),
    },
  }),
  [FETCH_TEAMS_SUCCESS]: (state, { payload }) => ({
    ...state,
    teams: {
      ...state.teams,
      data: payload.data,
    },
    meta: {
      loading: computeLoading(state.meta.loading, 'teams', false),
    },
  }),
  [FETCH_TEAMS_ERROR]: (state, { payload }) => ({
    ...state,
    meta: {
      loading: computeLoading(state.meta.loading, 'teams', false),
    },
  }),
  [combineActions(fetchTeamsPagination, setTeamsPagination)]: (state, { payload }) => ({
    ...state,
    teams: {
      ...state.teams,
      pagination: {
        page: payload.page || defaultState.teams.pagination.page,
        limit: payload.limit || defaultState.teams.pagination.limit,
      },
    },
  }),
  [FETCH_SERVICES_REQUEST]: (state) => ({
    ...state,
    meta: {
      loading: computeLoading(state.meta.loading, 'services', true),
    },
  }),
  [FETCH_SERVICES_SUCCESS]: (state, { payload }) => ({
    ...state,
    services: {
      ...state.services,
      data: payload.data,
    },
    meta: {
      loading: computeLoading(state.meta.loading, 'services', false),
    },
  }),
  [FETCH_SERVICES_ERROR]: (state, { payload }) => ({
    ...state,
    meta: {
      loading: computeLoading(state.meta.loading, 'services', false),
    },
  }),
  [combineActions(fetchServicesPagination, setServicesPagination)]: (state, { payload }) => ({
    ...state,
    services: {
      ...state.services,
      pagination: {
        page: payload.page || defaultState.services.pagination.page,
        limit: payload.limit || defaultState.services.pagination.limit,
      },
    },
  }),
  [FETCH_ACCOUNTS_REQUEST]: (state) => ({
    ...state,
    meta: {
      loading: computeLoading(state.meta.loading, 'accounts', true),
    },
  }),
  [FETCH_ACCOUNTS_SUCCESS]: (state, { payload }) => ({
    ...state,
    accounts: {
      ...state.accounts,
      data: payload.data,
    },
    meta: {
      loading: computeLoading(state.meta.loading, 'accounts', false),
    },
  }),
  [FETCH_ACCOUNTS_ERROR]: (state, { payload }) => ({
    ...state,
    meta: {
      loading: computeLoading(state.meta.loading, 'accounts', false),
    },
  }),
  [combineActions(fetchAccountsPagination, setAccountsPagination)]: (state, { payload }) => ({
    ...state,
    accounts: {
      ...state.accounts,
      pagination: {
        page: payload.page || defaultState.accounts.pagination.page,
        limit: payload.limit || defaultState.accounts.pagination.limit,
      },
    },
  }),
}, defaultState);
