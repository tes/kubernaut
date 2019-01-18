import { takeEvery, call, put, select } from 'redux-saga/effects';
import { startSubmit, stopSubmit } from 'redux-form';
import { push, getLocation } from 'connected-react-router';
import {
  extractFromQuery,
  alterQuery,
  makeQueryString,
  parseQueryString,
 } from './lib/query';
import {
  initServiceManage,
  updateServiceStatusForNamespace,
  selectNamespaces,
  updateServiceStatusSuccess,
  fetchServices,
  fetchNamespacesPagination,
  selectPaginationState,
  setPagination,
  FETCH_SERVICE_REQUEST,
  FETCH_SERVICE_SUCCESS,
  FETCH_SERVICE_ERROR,
  FETCH_SERVICE_NAMESPACES_STATUS_REQUEST,
  FETCH_SERVICE_NAMESPACES_STATUS_SUCCESS,
  FETCH_SERVICE_NAMESPACES_STATUS_ERROR,
  canManageRequest,
  setCanManage,
} from '../modules/serviceManage';
import {
  getService,
  getServiceNamespacesStatus,
  enableServiceForNamespace,
  disableServiceForNamespace,
  getCanManageAnyNamespace,
} from '../lib/api';

export function* checkPermissionSaga({ payload: { match, ...options }}) {
  try {
    yield put(canManageRequest());
    const hasPermission = yield call(getCanManageAnyNamespace);
    yield put(setCanManage(hasPermission.answer));
  } catch(error) {
    if (!options.quiet) console.error(error); // eslint-disable-line no-console
  }
}

export function* fetchServiceInfoSaga({ payload: { match, ...options } }) {
  if (!match) return;
  const { registry, name: service } = match.params;
  if (!registry || !service) return;
  yield put(FETCH_SERVICE_REQUEST());
  try {
    const data = yield call(getService, { registry, service });
    yield put(FETCH_SERVICE_SUCCESS({ data }));
  } catch(error) {
    if (!options.quiet) console.error(error); // eslint-disable-line no-console
    yield put(FETCH_SERVICE_ERROR({ error: error.message }));
  }
}

export function* fetchServiceNamespacesStatusSaga({ payload = { } }) {
  const { registry, name: service, ...options } = payload;
  const { page, limit } = yield select(selectPaginationState);
  const offset = (page - 1) * limit;

  yield put(FETCH_SERVICE_NAMESPACES_STATUS_REQUEST());
  try {
    const data = yield call(getServiceNamespacesStatus, registry, service, offset, limit);
    yield put(FETCH_SERVICE_NAMESPACES_STATUS_SUCCESS({ data }));
  } catch(error) {
    if (!options.quiet) console.error(error); // eslint-disable-line no-console
    yield put(FETCH_SERVICE_NAMESPACES_STATUS_ERROR({ error: error.message }));
  }
}

export function* updateServiceStatusSaga({ payload = {} }) {
  const {
    namespaceId,
    serviceId,
    newValue,
    ...options
  } = payload;

  const { offset, limit } = yield select(selectNamespaces);
  yield put(startSubmit('serviceManage'));
  try {
    let data;
    if (newValue) data = yield call(enableServiceForNamespace, namespaceId, serviceId, offset, limit, true);
    else data = yield call(disableServiceForNamespace, namespaceId, serviceId, offset, limit, true);
    yield put(updateServiceStatusSuccess({ data }));
    yield put(stopSubmit('serviceManage'));
  } catch(error) {
    if (!options.quiet) console.error(error); // eslint-disable-line no-console
    yield put(stopSubmit('serviceManage'));
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
  yield put(fetchServices(match.params));
}

export default [
  takeEvery(initServiceManage, checkPermissionSaga),
  takeEvery(initServiceManage, fetchServiceInfoSaga),
  takeEvery(updateServiceStatusForNamespace, updateServiceStatusSaga),
  takeEvery(fetchServices, fetchServiceNamespacesStatusSaga),
  takeEvery(fetchNamespacesPagination, paginationSaga),
  takeEvery(initServiceManage, locationChangeSaga),
];
