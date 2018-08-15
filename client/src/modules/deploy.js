import { createAction, handleActions } from 'redux-actions';
import { createFormAction } from 'redux-form-saga';
import { getFormValues } from 'redux-form';

import {
  getReleases,
} from '../lib/api';

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

export const getDeployFormValues = getFormValues('deploy');

export async function asyncValidateForm(values) {
  const {
    registry,
    service,
    version,
  } = values;

  if (!service) {
    throw { service: 'Please provide a service name' }; // eslint-disable-line no-throw-literal
  } else {
    try {
      const data = await getReleases({ service, registry });
      if (data.count === 0) throw { service: `'${registry}/${service}' does not exist`}; // eslint-disable-line no-throw-literal
    } catch(error) {
      if (error.service) throw error;
      console.error(error); // eslint-disable-line no-console
      throw { service: 'There was an error looking up services' }; // eslint-disable-line no-throw-literal
    }
  }


  if (!version) {
    throw { version: 'Please provide a version' }; // eslint-disable-line no-throw-literal
  } else {
    try {
      const data = await getReleases({ service, registry, version });
      if (data.count === 0) throw { version: `'${registry}/${service}@${version}' does not exist`}; // eslint-disable-line no-throw-literal
    } catch(error) {
      if (error.version) throw error;
      console.error(error); // eslint-disable-line no-console
      throw { version: 'There was an error looking up versions' }; // eslint-disable-line no-throw-literal
    }
  }

}

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
