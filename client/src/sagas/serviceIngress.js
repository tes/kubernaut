import { takeLatest, call, put, select, race, take } from 'redux-saga/effects';
import { push, replace, getLocation } from 'connected-react-router';
import { get as _get } from 'lodash';
import {
  extractFromQuery,
  alterQuery,
  makeQueryString,
  parseQueryString,
} from './lib/query';
import {
  initIngressPage,
  FETCH_SERVICE_REQUEST,
  FETCH_SERVICE_SUCCESS,
  FETCH_SERVICE_ERROR,
  FETCH_TEAM_REQUEST,
  FETCH_TEAM_SUCCESS,
  FETCH_TEAM_ERROR,
  FETCH_INGRESS_VERSIONS_REQUEST,
  FETCH_INGRESS_VERSIONS_SUCCESS,
  FETCH_INGRESS_VERSIONS_ERROR,
  FETCH_INGRESS_VERSION_REQUEST,
  FETCH_INGRESS_VERSION_SUCCESS,
  FETCH_INGRESS_VERSION_ERROR,
  selectService,
  selectPaginationState,
  canManageRequest,
  setCanManage,
  canWriteIngressRequest,
  setCanWriteIngress,
  canReadIngressRequest,
  setCanReadIngress,
  fetchVersionsPagination,
  setPagination,
  fetchVersions,
  fetchVersion,
} from '../modules/serviceIngress';
import {
  getService,
  getCanManageAnyNamespace,
  getTeamForService,
  hasPermission,
  getIngressVersions,
  getIngressVersion,
} from '../lib/api';

export function* fetchNewJobVersionPageDataSaga({ payload: { location, match, ...options } }) {
  if (!match) return;
  const { registry, name: service, version } = match.params;
  const pagination = parseQueryString(extractFromQuery(location.search, 'pagination') || '');
  yield put(setPagination(pagination));

  yield put(FETCH_SERVICE_REQUEST());
  try {
    const data = yield call(getService, { registry, service });
    yield put(FETCH_SERVICE_SUCCESS({ data }));

    yield put(fetchVersions());

    if (!version) {
      const { payload: versions } = yield take(FETCH_INGRESS_VERSIONS_SUCCESS);
      if (versions && versions.data && versions.data.count) {
        const latestId = _get(versions, 'data.items[0].id');
        yield put(replace(`/services/${registry}/${service}/ingress/${latestId}`));
      }
    } else {
      yield put(fetchVersion(version));
    }
  } catch(error) {
    if (!options.quiet) console.error(error); // eslint-disable-line no-console
    yield put(FETCH_SERVICE_ERROR({ error: error.message }));
  }
}

export function* fetchVersionsSaga({ payload = {} }) {
  const options = payload;
  const { page, limit } = yield select(selectPaginationState);
  const offset = (page - 1) * limit;

  yield put(FETCH_INGRESS_VERSIONS_REQUEST());
  try {
    const service = yield select(selectService);
    const data = yield call(getIngressVersions, { serviceId: service.id, offset, limit });
    yield put(FETCH_INGRESS_VERSIONS_SUCCESS({ data }));
  } catch(error) {
    if (!options.quiet) console.error(error); // eslint-disable-line no-console
    yield put(FETCH_INGRESS_VERSIONS_ERROR({ error: error.message }));
  }
}

export function* fetchVersionSaga({ payload: id }) {

  yield put(FETCH_INGRESS_VERSION_REQUEST());
  try {
    const service = yield select(selectService);
    const data = yield call(getIngressVersion, service.id, id);
    yield put(FETCH_INGRESS_VERSION_SUCCESS({ data }));
  } catch(error) {
    console.error(error); // eslint-disable-line no-console
    yield put(FETCH_INGRESS_VERSION_ERROR({ error: error.message }));
  }
}


export function* fetchTeamForServiceSaga({ payload = {} }) {
  try {
    yield put(FETCH_TEAM_REQUEST());
    const raceResult = yield race({
      success: take(FETCH_SERVICE_SUCCESS),
      failure: take(FETCH_SERVICE_ERROR),
    });
    if (raceResult.failure) {
      yield put(FETCH_TEAM_ERROR());
      return;
    }
    const service = yield select(selectService);
    const data = yield call(getTeamForService, { registry: service.registry.name, service: service.name });
    yield put(FETCH_TEAM_SUCCESS({ data }));
  } catch (error) {
    console.error(error); // eslint-disable-line no-console
    yield put(FETCH_TEAM_ERROR());
  }
}

export function* checkPermissionSaga({ payload: { match, ...options }}) {
  try {
    yield put(canManageRequest());
    yield put(canReadIngressRequest());
    yield put(canWriteIngressRequest());
    const canMange = yield call(getCanManageAnyNamespace);
    yield put(setCanManage(canMange.answer));
    const canReadIngress = yield call(hasPermission, 'ingress-read');
    yield put(setCanReadIngress(canReadIngress.answer));
    const canWriteIngress = yield call(hasPermission, 'ingress-write');
    yield put(setCanWriteIngress(canWriteIngress.answer));
  } catch(error) {
    if (!options.quiet) console.error(error); // eslint-disable-line no-console
  }
}

export function* paginationSaga() {
  const location = yield select(getLocation);
  const pagination = yield select(selectPaginationState);
  yield put(push(`${location.pathname}?${alterQuery(location.search, { pagination: makeQueryString({ ...pagination }) })}`));
}

export default [
  takeLatest(initIngressPage, fetchNewJobVersionPageDataSaga),
  takeLatest(initIngressPage, checkPermissionSaga),
  takeLatest(initIngressPage, fetchTeamForServiceSaga),
  takeLatest(fetchVersionsPagination, paginationSaga),
  takeLatest(fetchVersions, fetchVersionsSaga),
  takeLatest(fetchVersion, fetchVersionSaga),
];
