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
export const SET_DEPLOYMENTS = createAction(`${actionsPrefix}/SET_DEPLOYMENTS`);
export const SET_INITIAL_FORM_VALUES = createAction(`${actionsPrefix}/SET_INITIAL_FORM_VALUES`);
export const FETCH_TEAM_REQUEST = createAction(`${actionsPrefix}/FETCH_TEAM_REQUEST`);
export const FETCH_TEAM_SUCCESS = createAction(`${actionsPrefix}/FETCH_TEAM_SUCCESS`);
export const submitForm = createFormAction(`${actionsPrefix}/SUBMIT_FORM`);
export const fetchServiceSuggestions = createAction(`${actionsPrefix}/FETCH_SERVICE_SUGGESTIONS`);
export const setServiceSuggestions = createAction(`${actionsPrefix}/SET_SERVICE_SUGGESTIONS`);
export const useServiceSuggestion = createAction(`${actionsPrefix}/USE_SERVICE_SUGGESTIONS`);
export const clearServiceSuggestions = createAction(`${actionsPrefix}/CLEAR_SERVICE_SUGGESTIONS`);
export const clearFormFields = createAction(`${actionsPrefix}/CLEAR_FORM_FIELDS`);
export const validateService = createAction(`${actionsPrefix}/VALIDATE_SERVICE`);
export const validateVersion = createAction(`${actionsPrefix}/VALIDATE_VERSION`);
export const fetchNamespacesForService = createAction(`${actionsPrefix}/FETCH_NAMESPACES_FOR_SERVICE`);
export const fetchLatestDeploymentsPerNamespace = createAction(`${actionsPrefix}/FETCH_DEPLOYMENTS_PER_NAMESPACE`);
export const fetchSecretVersions = createAction(`${actionsPrefix}/FETCH_SECRET_VERSIONS`);
export const setSecretVersions = createAction(`${actionsPrefix}/SET_SECRET_VERSIONS`);
export const setCanManage = createAction(`${actionsPrefix}/SET_CAN_MANAGE`);

export const getDeployFormValues = getFormValues('deploy');
export const selectNamespaces = (state) => state.deploy.namespaces;

const defaultState = {
  meta: {
    loading: false,
    error: '',
  },
  registries: [],
  namespaces: [],
  serviceSuggestions: [],
  deployments: [],
  secretVersions: [],
  initialValues: {},
  canManage: false,
  serviceName: '',
  registryName: '',
  version: '',
  team: {
    name: '',
  },
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
  [SET_DEPLOYMENTS]: (state, { payload }) => ({ ...state, deployments: payload.data }),
  [setServiceSuggestions]: (state, { payload }) => ({ ...state, serviceSuggestions: payload }),
  [setSecretVersions]: (state, { payload = {} }) => ({ ...state, secretVersions: payload.items }),
  [clearServiceSuggestions]: (state) => ({ ...state, serviceSuggestions: [] }),
  [SET_INITIAL_FORM_VALUES]: (state, { payload }) => ({
    ...state,
    initialValues: payload,
    serviceName: payload.service,
    registryName: payload.registry,
    version: payload.version,
  }),
  [setCanManage]: (state, { payload }) => ({
    ...state,
    canManage: payload,
  }),
  [FETCH_TEAM_REQUEST]: (state) => ({
    ...state,
    team: defaultState.team,
  }),
  [FETCH_TEAM_SUCCESS]: (state, { payload }) => ({
    ...state,
    team: payload.data,
  }),
}, defaultState);
