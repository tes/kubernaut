import { take, takeLatest, call, put, select } from 'redux-saga/effects';
import { SubmissionError } from 'redux-form';
import { push } from 'connected-react-router';

import {
  initForm,
  submitForm,
  selectTeam,
  FETCH_TEAM_REQUEST,
  FETCH_TEAM_SUCCESS,
  FETCH_TEAM_ERROR,
  setCanEdit,
} from '../modules/teamAttrs';
import {
  getTeamByName,
  setTeamAttributes,
  hasPermissionOn,
} from '../lib/api';

export function* checkPermissionSaga() {
  try {
    yield take(FETCH_TEAM_SUCCESS);
    const team = yield select(selectTeam);

    const editResult = yield call(hasPermissionOn, 'teams-manage', 'team', team.id);
    yield put(setCanEdit(editResult.answer));
  } catch(error) {
    console.error(error); // eslint-disable-line no-console
  }
}

export function* fetchTeamSaga({ payload = {} }) {
  const { match, ...options } = payload;
  if (!match) return;
  const { team } = match.params;
  if (!team) return;

  yield put(FETCH_TEAM_REQUEST());
  try {
    const data = yield call(getTeamByName, team);
    yield put(FETCH_TEAM_SUCCESS({ data }));
  } catch(error) {
    if (!options.quiet) console.error(error); // eslint-disable-line no-console
    yield put(FETCH_TEAM_ERROR({ error: error.message }));
  }
}

export function* saveAttributesSaga({ payload: formValues }, options = {}) {
  const { id, name } = yield select(selectTeam);
  const { attributes = [] } = formValues;

  const attrs = attributes.reduce((acc, { name, value }) => {
    return (acc[name] = value, acc);
  }, {});
  try {
    yield call(setTeamAttributes, id, attrs);
  } catch(err) {
    if (!options.quiet) console.error(err); // eslint-disable-line no-console
    return yield put(submitForm.failure(new SubmissionError({ _error: err.message || 'Something bad and unknown happened.' })));
  }
  yield put(submitForm.success());
  yield put(push(`/teams/${name}`));
}

export default [
  takeLatest(initForm, checkPermissionSaga),
  takeLatest(initForm, fetchTeamSaga),
  takeLatest(submitForm.REQUEST, saveAttributesSaga),
];
