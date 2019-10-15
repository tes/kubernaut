import { takeLatest, call, put, select } from 'redux-saga/effects';
import { startSubmit, stopSubmit, reset, formValueSelector } from 'redux-form';

import {
  fetchAccountInfo,
  FETCH_ACCOUNT_REQUEST,
  FETCH_ACCOUNT_SUCCESS,
  FETCH_ACCOUNT_ERROR,
  FETCH_TEAMS_REQUEST,
  FETCH_TEAMS_SUCCESS,
  FETCH_TEAMS_ERROR,
  UPDATE_TEAM_MEMBERSHIP_SUCCESS,
  setCanEdit,
  setCanManageTeam,
  addMembership,
  removeMembership,
  selectAccount,
} from '../modules/editAccountTeams';

import {
  getAccountById,
  getAccountTeamMembership,
  hasPermission,
  getCanManageAnyTeam,
  addTeamMembershipToAccount,
  removeTeamMembershipFromAccount,
} from '../lib/api';

export function* fetchAccountInfoSaga({ payload = {} }) {
  const { match, ...options } = payload;
  if (!match) return;
  const { accountId } = match.params;

  yield put(FETCH_ACCOUNT_REQUEST());
  try {
    const data = yield call(getAccountById, accountId);
    yield put(FETCH_ACCOUNT_SUCCESS({ data }));
  } catch(error) {
    if (!options.quiet) console.error(error); // eslint-disable-line no-console
    yield put(FETCH_ACCOUNT_ERROR({ error: error.message }));
  }
}

export function* fetchTeamsSaga({ payload = {} }) {
  const { match, ...options } = payload;
  if (!match) return;
  const { accountId } = match.params;

  yield put(FETCH_TEAMS_REQUEST());
  try {
    const data = yield call(getAccountTeamMembership, accountId);
    yield put(FETCH_TEAMS_SUCCESS({ data }));
  } catch(error) {
    if (!options.quiet) console.error(error); // eslint-disable-line no-console
    yield put(FETCH_TEAMS_ERROR({ error: error.message }));
  }
}

export function* addMembershipSaga({ payload = {} }) {
  const options = payload;
  const newMembership = yield select(formValueSelector('accountTeamMembership'), 'newMembership');
  if (!newMembership) return;

  try {
    yield put(startSubmit('accountTeamMembership'));
    const { id: accountId } = yield select(selectAccount);

    const data = yield call(addTeamMembershipToAccount, accountId, newMembership);
    yield put(UPDATE_TEAM_MEMBERSHIP_SUCCESS({ data }));
    yield put(stopSubmit('accountTeamMembership'));

  } catch (error) {
    if (!options.quiet) console.error(error); // eslint-disable-line no-console
    yield put(stopSubmit('accountTeamMembership'));
    yield put(reset('accountTeamMembership'));
  }
}

export function* removeMembershipSaga({ payload = {} }) {
  const { team, ...options } = payload;
  if (!team) return;

  try {
    yield put(startSubmit('accountTeamMembership'));
    const { id: accountId } = yield select(selectAccount);

    const data = yield call(removeTeamMembershipFromAccount, accountId, team);
    yield put(UPDATE_TEAM_MEMBERSHIP_SUCCESS({ data }));
    yield put(stopSubmit('accountTeamMembership'));

  } catch (error) {
    if (!options.quiet) console.error(error); // eslint-disable-line no-console
    yield put(stopSubmit('accountTeamMembership'));
    yield put(reset('accountTeamMembership'));
  }
}

export function* checkPermissionSaga({ payload = {}}) {
  try {
    const editResult = yield call(hasPermission, 'accounts-write');
    yield put(setCanEdit(editResult.answer));
    const manageTeamResult = yield call(getCanManageAnyTeam);
    yield put(setCanManageTeam(manageTeamResult.answer));
  } catch(error) {
    console.error(error); // eslint-disable-line no-console
  }
}

export default [
  takeLatest(fetchAccountInfo, fetchAccountInfoSaga),
  takeLatest(fetchAccountInfo, fetchTeamsSaga),
  takeLatest(fetchAccountInfo, checkPermissionSaga),
  takeLatest(addMembership, addMembershipSaga),
  takeLatest(removeMembership, removeMembershipSaga),
];
