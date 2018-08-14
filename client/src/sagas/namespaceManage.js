import { takeEvery, call, put, all, select } from 'redux-saga/effects';
import { startSubmit, stopSubmit } from 'redux-form';

import {
  initialise,
  updateServiceStatusForNamespace,
  selectServices,
  updateServiceStatusSuccess,
  fetchServicesPagination,
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

export function* initialiseSaga(action) {
  yield all([
    call(fetchNamespaceInfoSaga, action),
    call(fetchServicesWithNamespaceStatusSaga, action),
  ]);
}

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
  const { id, page = 1, limit = 20, ...options } = payload;
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

export default [
  takeEvery(initialise, initialiseSaga),
  takeEvery(updateServiceStatusForNamespace, updateServiceStatusSaga),
  takeEvery(fetchServicesPagination, fetchServicesWithNamespaceStatusSaga),
];
