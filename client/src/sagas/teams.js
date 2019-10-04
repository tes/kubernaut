import { takeLatest, call, put } from 'redux-saga/effects';

import {
  fetchTeamsPagination,
  FETCH_TEAMS_REQUEST,
  FETCH_TEAMS_SUCCESS,
  FETCH_TEAMS_ERROR,
} from '../modules/teams';

import { getTeams } from '../lib/api';

export function* fetchTeamsDataSaga({ payload = {} }) {
  const { page = 1, limit = 20, ...options } = payload;
  const offset = (page - 1) * limit;

  yield put(FETCH_TEAMS_REQUEST());
  try {
    const data = yield call(getTeams, { offset, limit });
    yield put(FETCH_TEAMS_SUCCESS({ data }));
  } catch(error) {
    if (!options.quiet) console.error(error); // eslint-disable-line no-console
    yield put(FETCH_TEAMS_ERROR({ error: error.message }));
  }
}

export default [
  takeLatest(fetchTeamsPagination, fetchTeamsDataSaga),
];
