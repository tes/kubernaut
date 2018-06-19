import { SubmissionError } from 'redux-form';
import { push } from 'connected-react-router';
import {
  makeDeployment,
  getRegistries,
  getNamespaces,
  fetchReleases,
} from '../lib/api';

const actionsPrefix = 'KUBERNAUT/DEPLOY';
export const INITIALISE = `${actionsPrefix}/INITIALISE`;
export const SET_LOADING = `${actionsPrefix}/SET_LOADING`;
export const CLEAR_LOADING = `${actionsPrefix}/CLEAR_LOADING`;
export const SET_REGISTRIES = `${actionsPrefix}/SET_REGISTRIES`;
export const SET_NAMESPACES = `${actionsPrefix}/SET_NAMESPACES`;

export function initialise() {
  return async (dispatch) => {
    dispatch({ type: INITIALISE });
    await dispatch(fetchRegistries());
    await dispatch(fetchNamespaces());
  };
}

export function fetchRegistries() {
  return async (dispatch) => {
    dispatch({ type: SET_LOADING });
    let data;
    try {
      data = await getRegistries();
      if (!data.count) return dispatch({ type: CLEAR_LOADING });
      dispatch({
        type: SET_REGISTRIES,
        data: data.items.map(({ name }) => (name)),
      });
      dispatch({ type: CLEAR_LOADING });
    } catch (e) {
      console.error(e);
      dispatch({ type: CLEAR_LOADING });
    }
  };
}

export function fetchNamespaces() {
  return async (dispatch) => {
    let data;
    try {
      data = await getNamespaces();
      if (!data.count) return;

      dispatch({
        type: SET_NAMESPACES,
        data: data.items.map(({ name, cluster }) => ({ name, cluster })),
      });
    } catch (e) {
      console.error(e);
    }
  };
}

export function triggerDeployment(formValues) {
  return async (dispatch) => {
    if (!formValues.registry) return Promise.reject(new SubmissionError({ registry: 'A registry is required' }));
    if (!formValues.service) return Promise.reject(new SubmissionError({ service: 'A service name is required' }));
    if (!formValues.version) return Promise.reject(new SubmissionError({ version: 'A version is required' }));
    if (!formValues.cluster) return Promise.reject(new SubmissionError({ cluster: 'A cluster destination is required' }));
    if (!formValues.namespace) return Promise.reject(new SubmissionError({ namespace: 'A namespace is required' }));

    let data;
    try {
      data = await makeDeployment(formValues);

    } catch(err) {
      console.error(err);
      return Promise.reject(new SubmissionError({ _error: err.message || 'Something bad and unknown happened.' }));
    }

    const { id } = data;
    return dispatch(push(`/deployments/${id}`));
  };
}

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
      const data = await fetchReleases({ service, registry });
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
      const data = await fetchReleases({ service, registry, version });
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
  },
  registries: [],
  namespaces: [],
};

export default function(oldState, action) {
  const state = oldState ? oldState : defaultState;
  switch (action.type) {
    case INITIALISE:
      return {
        ...defaultState
      };

    case SET_LOADING:
      return {
        ...state,
        meta: {
          loading: true,
        }
      };

      case CLEAR_LOADING:
        return {
          ...state,
          meta: {
            loading: false,
          }
        };

      case SET_REGISTRIES:
        return {
          ...state,
          registries: action.data,
        };

      case SET_NAMESPACES:
        return {
          ...state,
          namespaces: action.data,
        };

    default: {
      return state;
    }
  }
}
