import { createAction, handleActions, combineActions } from 'redux-actions';
import computeLoading from './lib/computeLoading';

const actionsPrefix = `KUBERNAUT/EDIT_ACCOUNT_TEAMS`;
export const fetchAccountInfo = createAction(`${actionsPrefix}/FETCH_ACCOUNT_INFO`);
export const FETCH_ACCOUNT_REQUEST = createAction(`${actionsPrefix}/FETCH_ACCOUNT_REQUEST`);
export const FETCH_ACCOUNT_SUCCESS = createAction(`${actionsPrefix}/FETCH_ACCOUNT_SUCCESS`);
export const FETCH_ACCOUNT_ERROR = createAction(`${actionsPrefix}/FETCH_ACCOUNT_ERROR`);
export const FETCH_TEAMS_REQUEST = createAction(`${actionsPrefix}/FETCH_TEAMS_REQUEST`);
export const FETCH_TEAMS_SUCCESS = createAction(`${actionsPrefix}/FETCH_TEAMS_SUCCESS`);
export const FETCH_TEAMS_ERROR = createAction(`${actionsPrefix}/FETCH_TEAMS_ERROR`);
export const UPDATE_TEAM_MEMBERSHIP_SUCCESS = createAction(`${actionsPrefix}/UPDATE_TEAM_MEMBERSHIP_SUCCESS`);
export const setCanEdit = createAction(`${actionsPrefix}/SET_CAN_EDIT`);
export const setCanManageTeam = createAction(`${actionsPrefix}/SET_CAN_MANAGE_TEAM`);
export const addMembership = createAction(`${actionsPrefix}/ADD_MEMBERSHIP`);
export const removeMembership = createAction(`${actionsPrefix}/REMOVE_MEMBERSHIP`);

export const selectAccount = (state) => (state.editAccountTeams.account);


const defaultState = {
  account: {},
  canEdit: false,
  canManageTeam: false,
  meta: {
    loading: {
      sections: {
        account: false,
        teams: false,
      },
      loadingPercent: 100,
    },
  },
  teamMembership: {
    initialValues: {},
    currentMembership: [],
    noMembership: [],
  },
};

export default handleActions({
  [FETCH_ACCOUNT_REQUEST]: (state) => ({
    ...state,
    account: defaultState.account,
    meta: {
      loading: computeLoading(state.meta.loading, 'account', true),
    },
  }),
  [FETCH_ACCOUNT_SUCCESS]: (state, { payload }) => ({
    ...state,
    account: payload.data,
    meta: {
      loading: computeLoading(state.meta.loading, 'account', false),
    },
  }),
  [FETCH_ACCOUNT_ERROR]: (state, { payload }) => ({
    ...state,
    meta: {
      loading: computeLoading(state.meta.loading, 'account', false),
      error: payload.error,
    },
  }),
  [FETCH_TEAMS_REQUEST]: (state) => ({
    ...state,
    teams: defaultState.teams,
    meta: {
      loading: computeLoading(state.meta.loading, 'teams', true),
    },
  }),
  [combineActions(FETCH_TEAMS_SUCCESS, UPDATE_TEAM_MEMBERSHIP_SUCCESS)]: (state, { payload }) => {
    const { data } = payload;
    const initialValues = {};
    data.currentMembership.forEach((team) => {
      initialValues[team.id] = team;
    });
    return {
      ...state,
      teamMembership: {
        ...defaultState.teamMembership,
        initialValues,
        currentMembership: data.currentMembership,
        noMembership: data.noMembership,
      },
      meta: {
        loading: computeLoading(state.meta.loading, 'teams', false),
      },
    };
  },
  [FETCH_TEAMS_ERROR]: (state, { payload }) => ({
    ...state,
    meta: {
      loading: computeLoading(state.meta.loading, 'teams', false),
      error: payload.error,
    },
  }),
  [setCanEdit]: (state, { payload }) => ({
    ...state,
    canEdit: payload,
  }),
  [setCanManageTeam]: (state, { payload }) => ({
    ...state,
    canManageTeam: payload,
  }),
}, defaultState);
