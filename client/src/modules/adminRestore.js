import { createAction, handleActions, combineActions } from 'redux-actions';
import {
  getFormValues as rfGetFormValues,
} from 'redux-form';

const actionsPrefix = 'KUBERNAUT/ADMIN_RESTORE';
export const initAdminRestorePage = createAction(`${actionsPrefix}/INIT`);
export const changeType = createAction(`${actionsPrefix}/CHANGE_TYPE`);
export const restore = createAction(`${actionsPrefix}/RESTORE`);
export const fetchDeletedPagination = createAction(`${actionsPrefix}/FETCH_VERSIONS_PAGINATION`);
export const fetchDeleted = createAction(`${actionsPrefix}/FETCH_DELETED`);
export const FETCH_DELETED_REQUEST = createAction(`${actionsPrefix}/FETCH_DELETED_REQUEST`);
export const FETCH_DELETED_SUCCESS = createAction(`${actionsPrefix}/FETCH_DELETED_SUCCESS`);
export const FETCH_DELETED_ERROR = createAction(`${actionsPrefix}/FETCH_DELETED_ERROR`);
export const setPagination = createAction(`${actionsPrefix}/SET_PAGINATION`);

export const getFormValues = (state) => rfGetFormValues('adminRestore')(state);
export const selectPaginationState = (state) => (state.adminRestore.deleted.pagination);

const defaultState = {
  deleted: {
    data: {
      limit: 0,
      offset: 0,
      count: 0,
      pages: 0,
      page: 0,
      items: [],
    },
    meta: {
      loading: false,
    },
    pagination: {
      page: 1,
      limit: 20,
    },
  },
};

export default handleActions({
  [FETCH_DELETED_REQUEST]: (state) => ({
    ...state,
    deleted: {
      ...state.deleted,
      data: defaultState.deleted.data,
      meta: {
        loading: true,
      }
    },
  }),
  [FETCH_DELETED_SUCCESS]: (state, { payload }) => ({
    ...state,
    deleted: {
      ...state.deleted,
      data: payload.data,
      meta: {
        loading: false,
      }
    },
  }),
  [FETCH_DELETED_ERROR]: (state, { payload }) => ({
    ...state,
    deleted: {
      ...state.deleted,
      meta: {
        error: payload.error,
      },
    },
  }),
  [combineActions(fetchDeletedPagination, setPagination)]: (state, { payload }) => ({
    ...state,
    deleted: {
      ...state.deleted,
      pagination: {
        page: payload.page || defaultState.deleted.pagination.page,
        limit: payload.limit || defaultState.deleted.pagination.limit,
      },
    },
  }),
}, defaultState);
