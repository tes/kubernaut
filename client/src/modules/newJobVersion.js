import { createAction, handleActions } from 'redux-actions';
import { safeLoad } from 'js-yaml';
import { get as _get } from 'lodash';
import computeLoading from './lib/computeLoading';

const actionsPrefix = 'KUBERNAUT/NEW_JOB_VERSION';
export const INITIALISE = createAction(`${actionsPrefix}/INITIALISE`);
export const toggleCollapsed = createAction(`${actionsPrefix}/TOGGLE_COLLAPSED`);

export const FETCH_JOB_REQUEST = createAction(`${actionsPrefix}/FETCH_JOB_REQUEST`);
export const FETCH_JOB_SUCCESS = createAction(`${actionsPrefix}/FETCH_JOB_SUCCESS`);
export const FETCH_JOB_ERROR = createAction(`${actionsPrefix}/FETCH_JOB_ERROR`);
export const FETCH_JOB_VERSIONS_REQUEST = createAction(`${actionsPrefix}/FETCH_JOB_VERSIONS_REQUEST`);
export const FETCH_JOB_VERSIONS_SUCCESS = createAction(`${actionsPrefix}/FETCH_JOB_VERSIONS_SUCCESS`);
export const FETCH_JOB_VERSIONS_ERROR = createAction(`${actionsPrefix}/FETCH_JOB_VERSIONS_ERROR`);


function valuesFromYaml(parsed) {
  const { spec } = parsed || {};
  if (!spec) return {};

  return {
    schedule: spec.schedule,
    concurrencyPolicy: _get(spec, 'concurrencyPolicy', 'Allow'),
    initContainers: _get(spec, 'jobTemplate.spec.template.spec.initContainers', []),
    containers: _get(spec, 'jobTemplate.spec.template.spec.containers', []),
    volumes: _get(spec, 'jobTemplate.spec.template.spec.volumes', []).map(v => {
      const toReturn = {
        name: v.name,
      };
      if (v.emptyDir) toReturn.type = 'emptyDir';
      if (v.configMap) {
        toReturn.type = 'configMap';
        toReturn.configMap = v.configMap;
      }

      return toReturn;
    }),
  };
}

const defaultState = {
  initialValues: {},
  meta: {
    loading: {
      sections: {
        job: false,
        priorVersion: false,
      },
      loadingPercent: 100,
    },
  },
  collapsed: {
    initContainers: true,
    containers: false,
    volumes: true,
  },
  job: {
    data: {
      name: '',
    },
  },
};


export default handleActions({
  [INITIALISE]: () => ({ ...defaultState }),
  [toggleCollapsed]: (state, { payload }) => ({
    ...state,
    collapsed: {
      ...state.collapsed,
      [payload]: !state.collapsed[payload] || false, // in case we get undefined, just make it false.
    }
  }),
  [FETCH_JOB_REQUEST]: (state) => ({
    ...state,
    meta: {
      loading: computeLoading(state.meta.loading, { job: true, priorVersion: true }),
    },
    job: {
      ...state.job,
    },
  }),
  [FETCH_JOB_SUCCESS]: (state, { payload }) => ({
    ...state,
    meta: {
      loading: computeLoading(state.meta.loading, 'job', false),
    },
    job: {
      ...state.job,
      data: payload.data,
    },
  }),
  [FETCH_JOB_ERROR]: (state, { payload }) => ({
    ...state,
    meta: {
      loading: computeLoading(state.meta.loading, 'job', false),
    },
    job: {
      ...state.job,
    },
  }),
  [FETCH_JOB_VERSIONS_SUCCESS]: (state, { payload }) => {
    const newState = {
      ...state,
      meta: {
        loading: computeLoading(state.meta.loading, 'priorVersion', false),
      },
      versions: {
        ...state.versions,
        data: payload.data,
      },
    };

    if (payload && payload.version ) {
      newState.initialValues = valuesFromYaml(safeLoad(payload.version.yaml || ''));
    }
    return newState;
  },
  [FETCH_JOB_VERSIONS_ERROR]: (state, { payload }) => ({
    ...state,
    meta: {
      loading: computeLoading(state.meta.loading, 'priorVersion', false),
    },
  }),
}, defaultState);
