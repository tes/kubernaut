import { createAction, handleActions } from 'redux-actions';

const actionsPrefix = 'KUBERNAUT/ADMIN';
export const initAdminPage = createAction(`${actionsPrefix}/INIT`);

export const fetchReleases = createAction(`${actionsPrefix}/FETCH_RELEASES`);
export const FETCH_SUMMARY_REQUEST = createAction(`${actionsPrefix}/FETCH_SUMMARY_REQUEST`);
export const FETCH_SUMMARY_SUCCESS = createAction(`${actionsPrefix}/FETCH_SUMMARY_SUCCESS`);
export const FETCH_SUMMARY_ERROR = createAction(`${actionsPrefix}/FETCH_SUMMARY_ERROR`);

const defaultState = {
  summary: {
    data: {
      accounts: 0,
      clusters: 0,
      deployments: 0,
      jobs: 0,
      namespaces: 0,
      registries: 0,
      releases: 0,
      services: 0,
      teams: 0,
    },
    meta: {
      loading: false,
    },
  },
};

export default handleActions({
  [FETCH_SUMMARY_REQUEST]: (state) => ({
    ...state,
    summary: {
      ...state.summary,
      data: defaultState.summary.data,
      meta: {
        loading: true,
      }
    },
  }),
  [FETCH_SUMMARY_SUCCESS]: (state, { payload }) => ({
    ...state,
    summary: {
      ...state.summary,
      data: payload.data,
      meta: {
        loading: false,
      }
    },
  }),
  [FETCH_SUMMARY_ERROR]: (state, { payload }) => ({
    ...state,
    summary: {
      ...state.summary,
      meta: {
        error: payload.error,
      },
    },
  }),
}, defaultState);
