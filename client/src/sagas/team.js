import { takeLatest, call, put } from 'redux-saga/effects';

 import {
   initialiseTeamPage,
   fetchTeamPageData,
   FETCH_TEAM_REQUEST,
   FETCH_TEAM_SUCCESS,
   FETCH_TEAM_ERROR,
   setCanEdit,
} from '../modules/team';
import {
  getTeamByName,
  hasPermissionOn,
} from '../lib/api';

export function* fetchTeamInfoSaga({ payload: { name, ...options } }) {
  yield put(FETCH_TEAM_REQUEST());
  try {
    const data = yield call(getTeamByName, name);
    yield put(FETCH_TEAM_SUCCESS({ data }));
  } catch(error) {
    if (!options.quiet) console.error(error); // eslint-disable-line no-console
    yield put(FETCH_TEAM_ERROR({ error: error.message }));
  }
}

export function* checkPermissionSaga({ payload: { data, ...options } }) {
  const { id } = data;
  try {
    const canEdit = yield call(hasPermissionOn, 'teams-manage', 'team', id);
    yield put(setCanEdit(canEdit.answer));
  } catch(error) {
    console.error(error); // eslint-disable-line no-console
  }
}

export function* locationChangeSaga({ payload = {} }) {
  const { match, location } = payload;
  if (!match || !location) return;

  yield put(fetchTeamPageData({ name: match.params.team }));
  // yield take(FETCH_TEAM_SUCCESS);
}

export default [
  takeLatest(fetchTeamPageData, fetchTeamInfoSaga),
  takeLatest(FETCH_TEAM_SUCCESS, checkPermissionSaga),
  takeLatest(initialiseTeamPage, locationChangeSaga),
];
