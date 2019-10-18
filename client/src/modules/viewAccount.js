import { createAction, handleActions } from 'redux-actions';
import computeLoading from './lib/computeLoading';

const actionsPrefix = `KUBERNAUT/VIEW_ACCOUNT`;
export const fetchAccountInfo = createAction(`${actionsPrefix}/FETCH_ACCOUNT_INFO`);
export const FETCH_ACCOUNT_REQUEST = createAction(`${actionsPrefix}/FETCH_ACCOUNT_REQUEST`);
export const FETCH_ACCOUNT_SUCCESS = createAction(`${actionsPrefix}/FETCH_ACCOUNT_SUCCESS`);
export const FETCH_ACCOUNT_ERROR = createAction(`${actionsPrefix}/FETCH_ACCOUNT_ERROR`);
export const setCanEdit = createAction(`${actionsPrefix}/SET_CAN_EDIT`);
export const setCanManageTeam = createAction(`${actionsPrefix}/SET_CAN_MANAGE_TEAM`);

const defaultState = {
  account: {
    roles: {
      registries: [],
      namespaces: [],
      system: [],
      teams: [],
    }
  },
  canEdit: false,
  canManageTeam: false,
  meta: {
    loading: {
      sections: {
        account: false,
        namespaces: false,
        registries: false,
      },
      loadingPercent: 100,
    },
  },
  namespaces: {
    count: 0,
    items: [],
  },
  registries: {
    count: 0,
    items: [],
  }
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
  [setCanEdit]: (state, { payload }) => ({
    ...state,
    canEdit: payload,
  }),
  [setCanManageTeam]: (state, { payload }) => ({
    ...state,
    canManageTeam: payload,
  }),
}, defaultState);
