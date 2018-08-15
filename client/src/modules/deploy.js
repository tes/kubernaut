import { createAction, handleActions } from 'redux-actions';
import { createFormAction } from 'redux-form-saga';
import { getFormValues } from 'redux-form';

const actionsPrefix = 'KUBERNAUT/DEPLOY';
export const INITIALISE = createAction(`${actionsPrefix}/INITIALISE`);
export const INITIALISE_ERROR = createAction(`${actionsPrefix}/INITIALISE_ERROR`);
export const SET_LOADING = createAction(`${actionsPrefix}/SET_LOADING`);
export const CLEAR_LOADING = createAction(`${actionsPrefix}/CLEAR_LOADING`);
export const SET_REGISTRIES = createAction(`${actionsPrefix}/SET_REGISTRIES`);
export const SET_NAMESPACES = createAction(`${actionsPrefix}/SET_NAMESPACES`);
export const submitForm = createFormAction(`${actionsPrefix}/SUBMIT_FORM`);
export const fetchServiceSuggestions = createAction(`${actionsPrefix}/FETCH_SERVICE_SUGGESTIONS`);
export const setServiceSuggestions = createAction(`${actionsPrefix}/SET_SERVICE_SUGGESTIONS`);
export const useServiceSuggestion = createAction(`${actionsPrefix}/USE_SERVICE_SUGGESTIONS`);
export const clearServiceSuggestions = createAction(`${actionsPrefix}/CLEAR_SERVICE_SUGGESTIONS`);
export const clearFormFields = createAction(`${actionsPrefix}/CLEAR_FORM_FIELDS`);
export const validateService = createAction(`${actionsPrefix}/VALIDATE_SERVICE`);
export const validateVersion = createAction(`${actionsPrefix}/VALIDATE_VERSION`);
export const fetchNamespacesForService = createAction(`${actionsPrefix}/FETCH_NAMESPACES_FOR_SERVICE`);

export const getDeployFormValues = getFormValues('deploy');

const defaultState = {
  meta: {
    loading: false,
    error: '',
  },
  registries: [],
  namespaces: [],
  serviceSuggestions: [],
};

export default handleActions({
  [INITIALISE]: () => ({ ...defaultState }),
  [INITIALISE_ERROR]: (state, { payload }) => ({
    ...defaultState,
    meta: {
      error: payload.error,
    },
  }),
  [SET_LOADING]: (state) => ({ ...state, meta: { loading: true } }),
  [CLEAR_LOADING]: (state) => ({ ...state, meta: { loading: false } }),
  [SET_REGISTRIES]: (state, { payload }) => ({ ...state, registries: payload.data }),
  [SET_NAMESPACES]: (state, { payload }) => ({ ...state, namespaces: payload.data }),
  [setServiceSuggestions]: (state, { payload }) => ({ ...state, serviceSuggestions: payload }),
  [clearServiceSuggestions]: (state) => ({ ...state, serviceSuggestions: [] }),
}, defaultState);
