import { createAction, handleActions } from 'redux-actions';
import { createFormAction } from 'redux-form-saga';
const actionsPrefix = 'KUBERNAUT/DEPLOYMENT';
export const fetchDeployment = createAction(`${actionsPrefix}/FETCH_DEPLOYMENT`);
export const FETCH_DEPLOYMENT_REQUEST = createAction(`${actionsPrefix}/FETCH_DEPLOYMENT_REQUEST`);
export const FETCH_DEPLOYMENT_SUCCESS = createAction(`${actionsPrefix}/FETCH_DEPLOYMENT_SUCCESS`);
export const FETCH_DEPLOYMENT_ERROR = createAction(`${actionsPrefix}/FETCH_DEPLOYMENT_ERROR`);
export const submitNoteForm = createFormAction(`${actionsPrefix}/SUBMIT_NOTE_FORM`);
export const openModal = createAction(`${actionsPrefix}/OPEN_MODAL`);
export const closeModal = createAction(`${actionsPrefix}/CLOSE_MODAL`);
export const setCanEdit = createAction(`${actionsPrefix}/SET_CAN_EDIT`);
export const toggleManifestOpen = createAction(`${actionsPrefix}/TOGGLE_MANIFEST`);

const defaultState = {
  data: null,
  meta: {},
  modalOpen: false,
  canEdit: false,
  manifestOpen: false,
};

export default handleActions({
  [FETCH_DEPLOYMENT_REQUEST]: () => ({
    ...defaultState,
    meta: {
      loading: true,
    },
  }),
  [FETCH_DEPLOYMENT_SUCCESS]: (state, { payload }) => ({
    ...state,
    data: payload.data,
    meta: {
      loading: false,
    },
  }),
  [FETCH_DEPLOYMENT_ERROR]: (state, { payload }) => ({
    ...state,
    meta: {
      error: payload.error,
    },
  }),
  [openModal]: (state) => ({
    ...state,
    modalOpen: true,
  }),
  [closeModal]: (state) => ({
    ...state,
    modalOpen: false,
  }),
  [setCanEdit]: (state, { payload }) => ({
    ...state,
    canEdit: payload,
  }),
  [toggleManifestOpen]: (state) => ({
    ...state,
    manifestOpen: !state.manifestOpen,
  }),
}, defaultState);
