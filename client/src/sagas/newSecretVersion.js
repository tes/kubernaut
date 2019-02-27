import { takeLatest, call, put, select } from 'redux-saga/effects';
import {
  resetSection,
  arrayPush,
  getFormValues,
  SubmissionError,
  arrayRemove,
  startAsyncValidation,
  stopAsyncValidation,
  getFormAsyncErrors,
} from 'redux-form';
import { push } from 'connected-react-router';
import {
  initNewSecretVersion,
  FETCH_VERSIONS_REQUEST,
  FETCH_VERSIONS_SUCCESS,
  FETCH_VERSIONS_ERROR,
  FETCH_NAMESPACE_REQUEST,
  FETCH_NAMESPACE_SUCCESS,
  FETCH_NAMESPACE_ERROR,
  addSecret,
  removeSecret,
  saveVersion,
  canManageRequest,
  setCanManage,
  selectNamespace,
  validateAnnotations,
} from '../modules/newSecretVersion';
import {
  getNamespace,
  hasPermissionOn,
  getSecretVersions,
  getSecretVersionWithData,
  saveSecretVersion,
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

export function* fetchLastVersionSaga({ payload = {} }) {
  const { registry, name: service, namespaceId, ...options } = payload.match.params;
  if (!registry || !service || !namespaceId) return;

  yield put(FETCH_VERSIONS_REQUEST());
  try {
    const data = yield call(getSecretVersions, registry, service, namespaceId, 0, 1);
    if (!data.items.length) yield put(FETCH_VERSIONS_SUCCESS());
    const latestVersion = yield call(getSecretVersionWithData, data.items[0].id);
    yield put(FETCH_VERSIONS_SUCCESS({ latestVersion }));
  } catch(error) {
    if (!options.quiet) console.error(error); // eslint-disable-line no-console
    yield put(FETCH_VERSIONS_ERROR({ error: error.message }));
  }
}

export function* addSecretSaga() {
  const formValues = yield select(getFormValues('newSecretVersion'));
  if (!formValues.newSecretSection) return;
  if (!formValues.newSecretSection.newSecretName || !formValues.newSecretSection.newSecretType) return;
  yield put(arrayPush('newSecretVersion', 'secrets', {
    key: formValues.newSecretSection.newSecretName,
    value: '',
    editor: formValues.newSecretSection.newSecretType
  }));
  yield put(resetSection('newSecretVersion', 'newSecretSection'));
}

export function* removeSecretSaga({ payload }) {
  yield put(arrayRemove('newSecretVersion', 'secrets', payload));
}

export function* saveVersionSaga() {
  const formValues = yield select(getFormValues('newSecretVersion'));
  const namespace = yield select(selectNamespace);

  try {
    const id = yield call(saveSecretVersion, formValues.registry, formValues.service, namespace.id, formValues);
    yield put(saveVersion.success());
    yield put(push(`/services/secrets/view/${id}`));
  } catch (err) {
    yield put(saveVersion.failure(new SubmissionError({ _error: err.message })));
  }
}

export function* validateAnnotationsSaga({ payload }) {
  const { annotations, index } = payload;
  yield put(startAsyncValidation('newSecretVersion'));
  const existingErrors = yield select(getFormAsyncErrors('newSecretVersion')) || {};

  if (annotations && annotations.length && annotations.filter(a => a.type === 'error').length) {
    const newErrors = {
      ...(existingErrors || {}),
      secrets: (existingErrors || {}).secrets || [],
    };
    newErrors.secrets[index] = { value: 'Invalid' };
    yield put(stopAsyncValidation('newSecretVersion', newErrors));
  } else {
    yield put(stopAsyncValidation('newSecretVersion', existingErrors));
  }
}

export default [
  takeLatest(initNewSecretVersion, checkPermissionSaga),
  takeLatest(initNewSecretVersion, fetchNamespaceInfoSaga),
  takeLatest(initNewSecretVersion, fetchLastVersionSaga),
  takeLatest(addSecret, addSecretSaga),
  takeLatest(removeSecret, removeSecretSaga),
  takeLatest(validateAnnotations, validateAnnotationsSaga),
  takeLatest(saveVersion.REQUEST, saveVersionSaga),
];
