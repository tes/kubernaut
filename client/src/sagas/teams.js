import { takeLatest, call, put, select } from 'redux-saga/effects';
import { push, getLocation } from 'connected-react-router';
import {
  extractFromQuery,
  alterQuery,
  makeQueryString,
  parseQueryString,
} from './lib/query';

import {
  initialiseTeamsPage,
  fetchTeams,
  fetchServices,
  fetchAccounts,
  fetchTeamsPagination,
  fetchServicesPagination,
  fetchAccountsPagination,
  FETCH_TEAMS_REQUEST,
  FETCH_TEAMS_SUCCESS,
  FETCH_TEAMS_ERROR,
  FETCH_SERVICES_REQUEST,
  FETCH_SERVICES_SUCCESS,
  FETCH_SERVICES_ERROR,
  FETCH_ACCOUNTS_REQUEST,
  FETCH_ACCOUNTS_SUCCESS,
  FETCH_ACCOUNTS_ERROR,
  setTeamsPagination,
  setServicesPagination,
  setAccountsPagination,
  selectTeamsPaginationState,
  selectServicesPaginationState,
  selectAccountsPaginationState,
} from '../modules/teams';

import {
  getTeams,
  getAccountsWithNoMembership,
  getServicesWithNoTeam,
} from '../lib/api';

export function* fetchTeamsDataSaga({ payload = {} }) {
  const options = payload;
  const { page, limit } = yield select(selectTeamsPaginationState);
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

export function* fetchAccountsDataSaga({ payload = {} }) {
  const options = payload;
  const { page, limit } = yield select(selectAccountsPaginationState);
  const offset = (page - 1) * limit;

  yield put(FETCH_ACCOUNTS_REQUEST());
  try {
    const data = yield call(getAccountsWithNoMembership, { offset, limit });
    yield put(FETCH_ACCOUNTS_SUCCESS({ data }));
  } catch(error) {
    if (!options.quiet) console.error(error); // eslint-disable-line no-console
    yield put(FETCH_ACCOUNTS_ERROR({ error: error.message }));
  }
}

export function* fetchServicesDataSaga({ payload = {} }) {
  const options = payload;
  const { page, limit } = yield select(selectServicesPaginationState);
  const offset = (page - 1) * limit;

  yield put(FETCH_SERVICES_REQUEST());
  try {
    const data = yield call(getServicesWithNoTeam, { offset, limit });
    yield put(FETCH_SERVICES_SUCCESS({ data }));
  } catch(error) {
    if (!options.quiet) console.error(error); // eslint-disable-line no-console
    yield put(FETCH_SERVICES_ERROR({ error: error.message }));
  }
}

export function* locationChangeSaga({ payload = {} }) {
  const { match, location } = payload;
  if (!match || !location) return;

  const teamsPagination = parseQueryString(extractFromQuery(location.search, 't-pagination') || '');
  const accountsPagination = parseQueryString(extractFromQuery(location.search, 'a-pagination') || '');
  const servicesPagination = parseQueryString(extractFromQuery(location.search, 's-pagination') || '');
  yield put(setTeamsPagination(teamsPagination));
  yield put(setAccountsPagination(accountsPagination));
  yield put(setServicesPagination(servicesPagination));

  yield put(fetchTeams());
  yield put(fetchAccounts());
  yield put(fetchServices());
}

export function* paginationSaga() {
  const location = yield select(getLocation);
  const teamsPagination = yield select(selectTeamsPaginationState);
  const accountsPagination = yield select(selectAccountsPaginationState);
  const servicesPagination = yield select(selectServicesPaginationState);

  yield put(push(`${location.pathname}?${alterQuery(location.search, {
    't-pagination': makeQueryString({ ...teamsPagination }),
    'a-pagination': makeQueryString({ ...accountsPagination }),
    's-pagination': makeQueryString({ ...servicesPagination }),
  })}`));
}

export default [
  takeLatest(initialiseTeamsPage, locationChangeSaga),
  takeLatest(fetchTeams, fetchTeamsDataSaga),
  takeLatest(fetchAccounts, fetchAccountsDataSaga),
  takeLatest(fetchServices, fetchServicesDataSaga),
  takeLatest(fetchTeamsPagination, paginationSaga),
  takeLatest(fetchServicesPagination, paginationSaga),
  takeLatest(fetchAccountsPagination, paginationSaga),
];
