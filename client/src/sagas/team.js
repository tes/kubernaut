import { takeLatest, call, put, take, select } from 'redux-saga/effects';
import { push, getLocation } from 'connected-react-router';
import {
  extractFromQuery,
  alterQuery,
  makeQueryString,
  parseQueryString,
} from './lib/query';

import {
  initialiseTeamPage,
  fetchTeamPageData,
  fetchServices,
  fetchServicesPagination,
  FETCH_TEAM_REQUEST,
  FETCH_TEAM_SUCCESS,
  FETCH_TEAM_ERROR,
  FETCH_TEAM_SERVICES_REQUEST,
  FETCH_TEAM_SERVICES_SUCCESS,
  FETCH_TEAM_SERVICES_ERROR,
  setCanEdit,
  setPagination,
  selectPaginationState,
  selectTeam,
} from '../modules/team';
import {
  getTeamByName,
  getTeamServices,
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

export function* paginationSaga() {
  const location = yield select(getLocation);
  const pagination = yield select(selectPaginationState);
  yield put(push(`${location.pathname}?${alterQuery(location.search, { pagination: makeQueryString({ ...pagination }) })}`));
}

export function* locationChangeSaga({ payload = {} }) {
  const { match, location } = payload;
  if (!match || !location) return;

  yield put(fetchTeamPageData({ name: match.params.team }));
  yield take(FETCH_TEAM_SUCCESS);

  const pagination = parseQueryString(extractFromQuery(location.search, 'pagination') || '');
  yield put(setPagination(pagination));

  yield put(fetchServices());
}

export function* fetchServicesForTeamSaga({ payload = {} }) {
  const options = payload;
  const { page, limit } = yield select(selectPaginationState);
  const offset = (page - 1) * limit;

  try {
    const { id } = yield select(selectTeam);
    if (!id) return;
    yield put(FETCH_TEAM_SERVICES_REQUEST());
    const data = yield call(getTeamServices, { teamId: id, offset, limit });
    yield put(FETCH_TEAM_SERVICES_SUCCESS({ data }));
  } catch(error) {
    if (!options.quiet) console.error(error); // eslint-disable-line no-console
    yield put(FETCH_TEAM_SERVICES_ERROR({ error: error.message }));
  }
}

export default [
  takeLatest(fetchTeamPageData, fetchTeamInfoSaga),
  takeLatest(FETCH_TEAM_SUCCESS, checkPermissionSaga),
  takeLatest(initialiseTeamPage, locationChangeSaga),
  takeLatest(fetchServices, fetchServicesForTeamSaga),
  takeLatest(fetchServicesPagination, paginationSaga),
];
