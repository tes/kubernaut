import { createAction, handleActions } from 'redux-actions';
const actionsPrefix = `KUBERNAUT/VIEW_ACCOUNT`;
export const fetchAccountInfo = createAction(`${actionsPrefix}/FETCH_ACCOUNT_INFO`);
export const FETCH_ACCOUNT_REQUEST = createAction(`${actionsPrefix}/FETCH_ACCOUNT_REQUEST`);
export const FETCH_ACCOUNT_SUCCESS = createAction(`${actionsPrefix}/FETCH_ACCOUNT_SUCCESS`);
export const FETCH_ACCOUNT_ERROR = createAction(`${actionsPrefix}/FETCH_ACCOUNT_ERROR`);
export const FETCH_NAMESPACES_REQUEST = createAction(`${actionsPrefix}/FETCH_NAMESPACES_REQUEST`);
export const FETCH_NAMESPACES_SUCCESS = createAction(`${actionsPrefix}/FETCH_NAMESPACES_SUCCESS`);
export const FETCH_NAMESPACES_ERROR = createAction(`${actionsPrefix}/FETCH_NAMESPACES_ERROR`);
export const FETCH_REGISTRIES_REQUEST = createAction(`${actionsPrefix}/FETCH_REGISTRIES_REQUEST`);
export const FETCH_REGISTRIES_SUCCESS = createAction(`${actionsPrefix}/FETCH_REGISTRIES_SUCCESS`);
export const FETCH_REGISTRIES_ERROR = createAction(`${actionsPrefix}/FETCH_REGISTRIES_ERROR`);

const computeLoading = (currentLoading, key, isLoading) => {
  const newLoading = {
    ...currentLoading,
    sections: {
      ...currentLoading.sections,
      [key]: isLoading,
    },
  };
  const numberOfSections = Object.keys(newLoading.sections).length;
  const step = Math.floor(100 / numberOfSections);
  newLoading.loadingPercent = Object.keys(newLoading.sections).reduce((acc, section) => {
    if (newLoading.sections[section]) return acc - step;
    return acc;
  }, 100);

  return newLoading;
};

const defaultState = {
  account: {},
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
  [FETCH_NAMESPACES_REQUEST]: (state) => ({
    ...state,
    namespaces: defaultState.namespaces,
    meta: {
      loading: computeLoading(state.meta.loading, 'namespaces', true),
    },
  }),
  [FETCH_NAMESPACES_SUCCESS]: (state, { payload }) => ({
    ...state,
    namespaces: payload.data,
    meta: {
      loading: computeLoading(state.meta.loading, 'namespaces', false),
    },
  }),
  [FETCH_NAMESPACES_ERROR]: (state, { payload }) => ({
    ...state,
    meta: {
      loading: computeLoading(state.meta.loading, 'namespaces', false),
      error: payload.error,
    },
  }),
  [FETCH_REGISTRIES_REQUEST]: (state) => ({
    ...state,
    registries: defaultState.registries,
    meta: {
      loading: computeLoading(state.meta.loading, 'registries', true),
    },
  }),
  [FETCH_REGISTRIES_SUCCESS]: (state, { payload }) => ({
    ...state,
    registries: payload.data,
    meta: {
      loading: computeLoading(state.meta.loading, 'registries', false),
    },
  }),
  [FETCH_REGISTRIES_ERROR]: (state, { payload }) => ({
    ...state,
    meta: {
      loading: computeLoading(state.meta.loading, 'registries', false),
      error: payload.error,
    },
  }),
}, defaultState);
