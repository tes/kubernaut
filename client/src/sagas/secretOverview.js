import { takeLatest, call, put, select } from 'redux-saga/effects';
import { push, getLocation } from 'connected-react-router';
import {
  extractFromQuery,
  alterQuery,
  makeQueryString,
  parseQueryString,
 } from './lib/query';
import {
  initSecretOverview,
  fetchVersionsPagination,
  selectPaginationState,
  setPagination,
  FETCH_NAMESPACE_REQUEST,
  FETCH_NAMESPACE_SUCCESS,
  FETCH_NAMESPACE_ERROR,
  FETCH_VERSIONS_REQUEST,
  FETCH_VERSIONS_SUCCESS,
  FETCH_VERSIONS_ERROR,
  fetchVersions,
  canManageRequest,
  setCanManage,
} from '../modules/secretOverview';
import {
  getNamespace,
  hasPermissionOn,
  getSecretVersions,
} from '../lib/api';

export function* checkPermissionSaga({ payload: { match, ...options }}) {
  try {
    yield put(canManageRequest());
    const hasPermission = yield call(hasPermissionOn, 'secrets-manage', 'namespace', match.params.namespaceId);
    yield put(setCanManage(hasPermission.answer));
  } catch(error) {
    if (!options.quiet) console.error(error); // eslint-disable-line no-console
  }
}

export function* fetchNamespaceInfoSaga({ payload: { match, ...options } }) {
  yield put(FETCH_NAMESPACE_REQUEST());
  try {
    const data = yield call(getNamespace, match.params.namespaceId);
    yield put(FETCH_NAMESPACE_SUCCESS({ data }));
  } catch(error) {
    if (!options.quiet) console.error(error); // eslint-disable-line no-console
    yield put(FETCH_NAMESPACE_ERROR({ error: error.message }));
  }
}

export function* paginationSaga() {
  const location = yield select(getLocation);
  const pagination = yield select(selectPaginationState);
  yield put(push(`${location.pathname}?${alterQuery(location.search, { pagination: makeQueryString({ ...pagination }) })}`));
}

export function* locationChangeSaga({ payload = {} }) {
  const { match, location} = payload;
  if(!match || !location) return;
  const pagination = parseQueryString(extractFromQuery(location.search, 'pagination') || '');
  yield put(setPagination(pagination));
  yield put(fetchVersions(match.params));
}

export function* fetchVersionsSaga({ payload = {} }) {
  const { registry, name: service, namespaceId, ...options } = payload;
  if (!registry || !service || !namespaceId) return;

  const { page, limit } = yield select(selectPaginationState);
  const offset = (page - 1) * limit;

  yield put(FETCH_VERSIONS_REQUEST());
  try {
    const data = yield call(getSecretVersions, registry, service, namespaceId, offset, limit);
    yield put(FETCH_VERSIONS_SUCCESS({ data }));
  } catch(error) {
    if (!options.quiet) console.error(error); // eslint-disable-line no-console
    yield put(FETCH_VERSIONS_ERROR({ error: error.message }));
  }
}

export default [
  takeLatest(initSecretOverview, checkPermissionSaga),
  takeLatest(initSecretOverview, fetchNamespaceInfoSaga),
  takeLatest(fetchVersionsPagination, paginationSaga),
  takeLatest(initSecretOverview, locationChangeSaga),
  takeLatest(fetchVersions, fetchVersionsSaga),
];
