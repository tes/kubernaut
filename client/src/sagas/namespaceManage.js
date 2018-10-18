import { takeEvery, call, put, select } from 'redux-saga/effects';
import { startSubmit, stopSubmit } from 'redux-form';
import { push, getLocation, LOCATION_CHANGE } from 'connected-react-router';
import { doesLocationMatch } from '../paths';
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
} from '../modules/namespaceManage';
import {
  getNamespace,
  getServicesWithStatusForNamespace,
  enableServiceForNamespace,
  disableServiceForNamespace,
} from '../lib/api';

export function* fetchNamespaceInfoSaga({ payload: { id, ...options } }) {
  yield put(FETCH_NAMESPACE_REQUEST());
  try {
    const data = yield call(getNamespace, id);
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
  const urlMatch = doesLocationMatch(payload.location, 'namespaceManage');
  if (!urlMatch) return;

  const pagination = parseQueryString(extractFromQuery(payload.location.search, 'pagination') || '');
  yield put(setPagination(pagination));
  yield put(fetchServices({ id: urlMatch.params.namespaceId }));
}

export default [
  takeEvery(initialise, fetchNamespaceInfoSaga),
  takeEvery(updateServiceStatusForNamespace, updateServiceStatusSaga),
  takeEvery(fetchServices, fetchServicesWithNamespaceStatusSaga),
  takeEvery(fetchServicesPagination, paginationSaga),
  takeEvery(LOCATION_CHANGE, locationChangeSaga),
];
