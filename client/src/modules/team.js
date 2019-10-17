import { createAction, handleActions } from 'redux-actions';

const actionsPrefix = 'KUBERNAUT/TEAM';
export const initialiseTeamPage = createAction(`${actionsPrefix}/INITIALISE`);
export const fetchTeamPageData = createAction(`${actionsPrefix}/FETCH_TEAM_PAGE_DATA`);

export const FETCH_TEAM_REQUEST = createAction(`${actionsPrefix}/FETCH_TEAM_REQUEST`);
export const FETCH_TEAM_SUCCESS = createAction(`${actionsPrefix}/FETCH_TEAM_SUCCESS`);
export const FETCH_TEAM_ERROR = createAction(`${actionsPrefix}/FETCH_TEAM_ERROR`);

export const setCanEdit = createAction(`${actionsPrefix}/SET_CAN_EDIT`);

export const selectTeam = (state) => (state.team.team.data);

const defaultState = {
  team: {
    meta: {},
    data: {
      name: '',
      attributes: {},
      services: [],
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
    team: {
      ...state.team,
      meta: {
        loading: true
      },
    },
  }),
  [FETCH_TEAM_SUCCESS]: (state, { payload }) => ({
    ...state,
    team: {
      ...state.team,
      meta: {
        loading: false,
      },
      data: payload.data,
    },
  }),
  [FETCH_TEAM_ERROR]: (state, { payload }) => ({
    ...state,
    team: {
      ...state.team,
      meta: {
        loading: false,
        error: payload.error,
      },
    },
  }),
  [setCanEdit]: (state, { payload }) => ({
    ...state,
    canEdit: payload,
  }),
}, defaultState);
