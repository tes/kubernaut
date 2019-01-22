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
  initialise,
  updateServiceStatusForNamespace,
  selectServices,
  updateServiceStatusSuccess,
  fetchServices,
  fetchServicesPagination,
  selectPaginationState,
  setPagination,
  FETCH_NAMESPACE_REQUEST,
  FETCH_NAMESPACE_SUCCESS,
  FETCH_NAMESPACE_ERROR,
  FETCH_SERVICES_NAMESPACE_STATUS_REQUEST,
  FETCH_SERVICES_NAMESPACE_STATUS_SUCCESS,
  FETCH_SERVICES_NAMESPACE_STATUS_ERROR,
  canManageRequest,
  setCanManage,
  canEditRequest,
  setCanEdit,
} from '../modules/namespaceManage';
import {
  getNamespace,
  getServicesWithStatusForNamespace,
  enableServiceForNamespace,
  disableServiceForNamespace,
  hasPermissionOn,
} from '../lib/api';

export function* checkPermissionSaga({ payload: { match, ...options }}) {
  if (!match) return;
  const { namespaceId } = match.params;
  if (!namespaceId) return;
  try {
    yield put(canManageRequest());
    yield put(canEditRequest());
    const hasPermission = yield call(hasPermissionOn, 'namespaces-manage', 'namespace', namespaceId);
    const canEdit = yield call(hasPermissionOn, 'namespaces-write', 'namespace', namespaceId);
    yield put(setCanManage(hasPermission.answer));
    yield put(setCanEdit(canEdit.answer));
  } catch(error) {
    if (!options.quiet) console.error(error); // eslint-disable-line no-console
  }
}

export function* fetchNamespaceInfoSaga({ payload: { match, ...options } }) {
  if (!match) return;
  const { namespaceId } = match.params;
  if (!namespaceId) return;
  yield put(FETCH_NAMESPACE_REQUEST());
  try {
    const data = yield call(getNamespace, namespaceId);
    yield put(FETCH_NAMESPACE_SUCCESS({ data }));
  } catch(error) {
    if (!options.quiet) console.error(error); // eslint-disable-line no-console
    yield put(FETCH_NAMESPACE_ERROR({ error: error.message }));
  }
}

export function* fetchServicesWithNamespaceStatusSaga({ payload = { } }) {
  const { id, ...options } = payload;
  const { page, limit } = yield select(selectPaginationState);
  const offset = (page - 1) * limit;

  yield put(FETCH_SERVICES_NAMESPACE_STATUS_REQUEST());
  try {
    const data = yield call(getServicesWithStatusForNamespace, id, offset, limit);
    yield put(FETCH_SERVICES_NAMESPACE_STATUS_SUCCESS({ data }));
  } catch(error) {
    if (!options.quiet) console.error(error); // eslint-disable-line no-console
    yield put(FETCH_SERVICES_NAMESPACE_STATUS_ERROR({ error: error.message }));
  }
}

export function* updateServiceStatusSaga({ payload = {} }) {
  const {
    namespaceId,
    serviceId,
    newValue,
    ...options
  } = payload;

  const { offset, limit } = yield select(selectServices);
  yield put(startSubmit('namespaceManage'));
  try {
    let data;
    if (newValue) data = yield call(enableServiceForNamespace, namespaceId, serviceId, offset, limit);
    else data = yield call(disableServiceForNamespace, namespaceId, serviceId, offset, limit);
    yield put(updateServiceStatusSuccess({ data }));
    yield put(stopSubmit('namespaceManage'));
  } catch(error) {
    if (!options.quiet) console.error(error); // eslint-disable-line no-console
    yield put(stopSubmit('namespaceManage'));
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
  yield put(fetchServices({ id: match.params.namespaceId }));
}

export default [
  takeEvery(initialise, checkPermissionSaga),
  takeEvery(initialise, fetchNamespaceInfoSaga),
  takeEvery(updateServiceStatusForNamespace, updateServiceStatusSaga),
  takeEvery(fetchServices, fetchServicesWithNamespaceStatusSaga),
  takeEvery(fetchServicesPagination, paginationSaga),
  takeEvery(initialise, locationChangeSaga),
];
