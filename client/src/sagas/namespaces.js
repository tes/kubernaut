import { takeLatest, call, put, select } from 'redux-saga/effects';
import { SubmissionError, reset } from 'redux-form';
import { push, getLocation } from 'connected-react-router';
import {
  parseFiltersFromQS,
  parseSearchFromQS,
  stringifyFiltersForQS,
  stringifySearchForQS,
} from '../modules/lib/filter';
import {
  extractFromQuery,
  alterQuery,
  makeQueryString,
  parseQueryString,
} from './lib/query';
import {
  initialiseNamespacesPage,
  fetchNamespaces,
  fetchNamespacesPagination,
  FETCH_NAMESPACES_REQUEST,
  FETCH_NAMESPACES_SUCCESS,
  FETCH_NAMESPACES_ERROR,
  setCanWrite,
  setClusters,
  getFormValues,
  submitForm,
  selectTableFilters,
  selectSearchFilter,
  selectPaginationState,
  addFilter,
  removeFilter,
  search,
  clearSearch,
  setFilters,
  setSearch,
  setPagination,
} from '../modules/namespaces';

import {
  getNamespaces,
  hasPermission,
  getClusters,
  saveNamespace,
} from '../lib/api';

const pageUrl = '/namespaces';

export function* fetchNamespacesDataSaga({ payload = {} }) {
  const options = payload;
  const { page, limit } = yield select(selectPaginationState);
  const offset = (page - 1) * limit;
  const filters = yield select(selectTableFilters, true);

  yield put(FETCH_NAMESPACES_REQUEST());
  try {
    const data = yield call(getNamespaces, { offset, limit, filters });
    yield put(FETCH_NAMESPACES_SUCCESS({ data }));
  } catch(error) {
    if (!options.quiet) console.error(error); // eslint-disable-line no-console
    yield put(FETCH_NAMESPACES_ERROR({ error: error.message }));
  }
}

export function* checkPermissionSaga() {
  try {
    const canWrite = yield call(hasPermission, 'namespaces-write');
    yield put(setCanWrite(canWrite.answer));
    if (canWrite.answer) {
      const clusters = yield call(getClusters);
      yield put(setClusters({ data: clusters }));
    }
  } catch(error) {
    console.error(error); // eslint-disable-line no-console
  }
}

export function* submitSaga() {
  try {
    const values = yield select(getFormValues);

    if (!values.name || !values.cluster || !values.context) {
      yield put(submitForm.failure());
      return;
    }
    const data = yield call(saveNamespace, values.name, values.cluster, values.context);
    yield put(submitForm.success());
    yield put(push(`/namespaces/${data.id}`));
  } catch (err) {
    console.error(err); // eslint-disable-line no-console
    yield put(submitForm.failure(new SubmissionError({ _error: err.message || 'Something bad and unknown happened.' })));
  }
}

export function* paginationSaga() {
  const location = yield select(getLocation);
  const pagination = yield select(selectPaginationState);
  yield put(push(`${pageUrl}?${alterQuery(location.search, { pagination: makeQueryString({ ...pagination }) })}`));
}

export function* addFilterSaga() {
  yield put(reset('namespaces_table_filter'));
  const location = yield select(getLocation);
  const filters = yield select(selectTableFilters);
  yield put(push(`${pageUrl}?${alterQuery(location.search, {
    filters: stringifyFiltersForQS(filters),
    pagination: null,
    search: null,
  })}`));
}

export function* removeFilterSaga() {
  const location = yield select(getLocation);
  const filters = yield select(selectTableFilters);
  yield put(push(`${pageUrl}?${alterQuery(location.search, {
    filters: stringifyFiltersForQS(filters),
    pagination: null,
  })}`));
}

export function* searchSaga() {
  const location = yield select(getLocation);
  const searchFilter = yield select(selectSearchFilter);
  yield put(push(`${pageUrl}?${alterQuery(location.search, {
    search: stringifySearchForQS(searchFilter),
    pagination: null,
  })}`));
}

export function* locationChangeSaga({ payload = {} }) {
  const { location } = payload;
  if (!location) return;

  const filters = parseFiltersFromQS(extractFromQuery(location.search, 'filters') || '');
  const search = parseSearchFromQS(extractFromQuery(location.search, 'search') || '');
  const pagination = parseQueryString(extractFromQuery(location.search, 'pagination') || '');
  yield put(setFilters(filters));
  yield put(setSearch(search));
  yield put(setPagination(pagination));
  yield put(fetchNamespaces());
}

export default [
  takeLatest(fetchNamespaces, fetchNamespacesDataSaga),
  takeLatest(initialiseNamespacesPage, checkPermissionSaga),
  takeLatest(initialiseNamespacesPage, locationChangeSaga),
  takeLatest(fetchNamespacesPagination, paginationSaga),
  takeLatest(addFilter, addFilterSaga),
  takeLatest(removeFilter, removeFilterSaga),
  takeLatest(search, searchSaga),
  takeLatest(clearSearch, searchSaga),
  takeLatest(submitForm.REQUEST, submitSaga),
];
