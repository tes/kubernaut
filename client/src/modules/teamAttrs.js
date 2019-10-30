import { createAction, handleActions } from 'redux-actions';
import { createFormAction } from 'redux-form-saga';
import {
  getFormValues as rfGetFormValues,
} from 'redux-form';
import computeLoading from './lib/computeLoading';

const actionsPrefix = 'KUBERNAUT/TEAM_ATTRS';
export const initForm = createAction(`${actionsPrefix}/INIT_FORM`);

export const FETCH_TEAM_REQUEST = createAction(`${actionsPrefix}/FETCH_TEAM_REQUEST`);
export const FETCH_TEAM_SUCCESS = createAction(`${actionsPrefix}/FETCH_TEAM_SUCCESS`);
export const FETCH_TEAM_ERROR = createAction(`${actionsPrefix}/FETCH_TEAM_ERROR`);

export const submitForm = createFormAction(`${actionsPrefix}/SUBMIT_FORM`);
export const setCanEdit = createAction(`${actionsPrefix}/SET_CAN_EDIT`);

export const selectTeam = (state) => (state.teamAttrs.team);
export const getFormValues = (state) => rfGetFormValues('teamAttrs')(state);

const defaultState = {
  canEdit: false,
  meta: {
    loading: {
      sections: {
        team: false,
      },
      loadingPercent: 100,
    },
  },
  team: {
    id: '',
    name: '',
    attributes: {},
  },
  initialValues: {
    attributes: []
  },
};

export default handleActions({
  [initForm]: (state, { payload }) => ({
    ...defaultState,
    initialValues: {
      ...defaultState.initialValues,
    }
  }),
  [FETCH_TEAM_REQUEST]: (state) => ({
    ...state,
    meta: {
      ...state.meta,
      loading: computeLoading(state.meta.loading, 'team', true),
    },
  }),
  [FETCH_TEAM_SUCCESS]: (state, { payload: { data } }) => ({
    ...state,
    meta: {
      ...state.meta,
      loading: computeLoading(state.meta.loading, 'team', false),
    },
    initialValues: {
      ...state.initialValues,
      attributes: Object.keys(data.attributes).reduce((arr, attr) => {
        return arr.concat({ name: attr, value: data.attributes[attr], tempKey: Math.random() });
      }, []),
    },
    team: data,
  }),
  [FETCH_TEAM_ERROR]: (state, { payload }) => ({
    ...state,
    meta: {
      ...state.meta,
      loading: computeLoading(state.meta.loading, 'team', false),
      error: payload.error,
    },
  }),
  [setCanEdit]: (state, { payload }) => ({
    ...state,
    canEdit: payload,
  }),
}, defaultState);
