import { createAction, handleActions, combineActions } from 'redux-actions';
import computeLoading from './lib/computeLoading';

const actionsPrefix = `KUBERNAUT/AUDIT`;
export const initAuditPage = createAction(`${actionsPrefix}/INIT_AUDIT_PAGE`);
export const fetchAudit = createAction(`${actionsPrefix}/FETCH_AUDIT`);
export const fetchAuditPagination = createAction(`${actionsPrefix}/FETCH_AUDIT_PAGINATION`);
export const FETCH_AUDIT_REQUEST = createAction(`${actionsPrefix}/FETCH_AUDIT_REQUEST`);
export const FETCH_AUDIT_SUCCESS = createAction(`${actionsPrefix}/FETCH_AUDIT_SUCCESS`);
export const FETCH_AUDIT_ERROR = createAction(`${actionsPrefix}/FETCH_AUDIT_ERROR`);
export const setCanView = createAction(`${actionsPrefix}/SET_CAN_VIEW`);
export const setPagination = createAction(`${actionsPrefix}/SET_PAGINATION`);

export const selectPaginationState = (state) => (state.audit.pagination);

const defaultState = {
  canView: false,
  meta: {
    loading: {
      sections: {
        audit: false,
      },
      loadingPercent: 100,
    },
  },
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
    limit: 30,
  },
};

export default handleActions({
  [FETCH_AUDIT_REQUEST]: (state) => ({
    ...state,
    data: defaultState.data,
    meta: {
      loading: computeLoading(state.meta.loading, 'audit', true),
    },
  }),
  [FETCH_AUDIT_SUCCESS]: (state, { payload }) => ({
    ...state,
    data: payload.data,
    meta: {
      loading: computeLoading(state.meta.loading, 'audit', false),
    },
  }),
  [FETCH_AUDIT_ERROR]: (state, { payload }) => ({
    ...state,
    meta: {
      loading: computeLoading(state.meta.loading, 'audit', false),
      error: payload.error,
    },
  }),
  [setCanView]: (state, { payload }) => ({
    ...state,
    canView: payload,
  }),
  [combineActions(fetchAuditPagination, setPagination)]: (state, { payload }) => ({
    ...state,
    pagination: {
      page: payload.page || defaultState.pagination.page,
      limit: payload.limit || defaultState.pagination.limit,
    },
  }),
}, defaultState);
