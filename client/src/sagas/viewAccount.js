import { takeLatest, call, put, select } from 'redux-saga/effects';
import { push, getLocation } from 'connected-react-router';
import paths from '../paths';
import {
  stringifyFiltersForQS,
} from '../modules/lib/filter';
import {
  alterQuery,
 } from './lib/query';

import { selectAccount } from '../modules/account';
import {
  fetchAccountInfo,
  FETCH_ACCOUNT_REQUEST,
  FETCH_ACCOUNT_SUCCESS,
  FETCH_ACCOUNT_ERROR,
  setCanEdit,
  setCanManageTeam,
  setCanGenerate,
  generateBearer,
  setBearerToken,
  auditAccount,
} from '../modules/viewAccount';

import {
  getAccountById,
  hasPermission,
  getCanManageAnyTeam,
  getBearerTokenForAccount,
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

export function* checkPermissionSaga({ payload = {}}) {
  const { match } = payload;
  if (!match) return;
  const { accountId } = match.params;

  try {
    const uiUserAccount = yield select(selectAccount);
    if (uiUserAccount.id === accountId) {
      yield put(setCanGenerate(true));
    } else {
      const generateResult = yield call(hasPermission, 'accounts-bearer');
      yield put(setCanGenerate(generateResult.answer));
    }

    const editResult = yield call(hasPermission, 'accounts-write');
    yield put(setCanEdit(editResult.answer));
    const manageTeamResult = yield call(getCanManageAnyTeam);
    yield put(setCanManageTeam(manageTeamResult.answer));
  } catch(error) {
    console.error(error); // eslint-disable-line no-console
  }
}

export function* generateBearerSaga({ payload = {} }) {
  try {
    const { id } = payload;
    if (!id) return;

    const { bearer } = yield call(getBearerTokenForAccount, id);
    yield put(setBearerToken(bearer));
  } catch (error) {
    console.error(error); // eslint-disable-line no-console
  }
}

export function* toAuditSaga({ payload = {} }) {
  const { id, name } = payload;
  const location = yield select(getLocation);
  yield put(push(`${paths.audit.route}?${alterQuery(location.search, {
    filters: stringifyFiltersForQS({
      sourceAccount: [{ value: id, displayValue: name, exact: true }],
    }),
  })}`));
}

export default [
  takeLatest(fetchAccountInfo, fetchAccountInfoSaga),
  takeLatest(fetchAccountInfo, checkPermissionSaga),
  takeLatest(generateBearer, generateBearerSaga),
  takeLatest(auditAccount, toAuditSaga),
];
