import { takeLatest, call, put, select } from 'redux-saga/effects';
import { push } from 'connected-react-router';
import { get as _get } from 'lodash';
import {
  resetSection,
  arrayPush,
  SubmissionError,
  arrayRemove,
  startAsyncValidation,
  stopAsyncValidation,
} from 'redux-form';
import {
  INITIALISE,
  FETCH_JOB_REQUEST,
  FETCH_JOB_SUCCESS,
  FETCH_JOB_ERROR,
  FETCH_JOB_VERSIONS_REQUEST,
  FETCH_JOB_VERSIONS_SUCCESS,
  FETCH_JOB_VERSIONS_ERROR,
  getFormValues,
  triggerPreview,
  updatePreview,
  submitForm,
  selectJob,
  addSecret,
  removeSecret,
  validateAnnotations,
  getFormAsyncErrors,
  setCanEdit,
} from '../modules/newJobVersion';
import {
  getJob,
  getJobVersions,
  getJobVersion,
  getPreviewOfJobVersion,
  saveJobVersion,
  hasPermissionOn,
} from '../lib/api';

export function* fetchNewJobVersionPageDataSaga({ payload: { match, ...options } }) {
  if (!match) return;
  const { id } = match.params;
  yield put(FETCH_JOB_REQUEST());
  try {
    const data = yield call(getJob, id);
    yield put(FETCH_JOB_SUCCESS({ data }));

    try {
      yield put(FETCH_JOB_VERSIONS_REQUEST());
      const versions = yield call(getJobVersions, { id, offset: 0, limit: 1 });

      if (versions && versions.count) {
        const version = yield call(getJobVersion, versions.items[0].id);
        yield put(FETCH_JOB_VERSIONS_SUCCESS({ version }));
      } else yield put(FETCH_JOB_VERSIONS_SUCCESS({ }));
    } catch(error) {
      if (!options.quiet) console.error(error); // eslint-disable-line no-console
      yield put(FETCH_JOB_VERSIONS_ERROR({ error: error.message }));
    }
  } catch(error) {
    if (!options.quiet) console.error(error); // eslint-disable-line no-console
    yield put(FETCH_JOB_ERROR({ error: error.message }));
  }
}

export function* checkPermissionSaga({ payload: { data, ...options } }) {
  try {
    const registryId = _get(data, 'registry.id', '');
    const canEdit = yield call(hasPermissionOn, 'jobs-write', 'registry', registryId);

    yield put(setCanEdit(canEdit.answer));
  } catch(error) {
    console.error(error); // eslint-disable-line no-console
  }
}

export function* previewValuesSaga() {
  try {
    const values = yield select(getFormValues);
    const data = yield call(getPreviewOfJobVersion, values);
    yield put(updatePreview(data));
  } catch (err) {
    console.error(err); // eslint-disable-line no-console
  }
}

export function* submitSaga() {
  try {
    const values = yield select(getFormValues);
    const job = yield select(selectJob);
    const data = yield call(saveJobVersion, job, values);
    yield put(submitForm.success());
    yield put(push(`/cronjobs/version/${data.id}`));
  } catch (err) {
    console.error(err); // eslint-disable-line no-console
    yield put(submitForm.failure(new SubmissionError({ _error: err.message || 'Something bad and unknown happened.' })));
  }
}

export function* validateAnnotationsSaga({ payload }) {
  const { annotations, index } = payload;
  yield put(startAsyncValidation('newJobVersion'));
  const existingErrors = yield select(getFormAsyncErrors) || {};

  if (annotations && annotations.length && annotations.filter(a => a.type === 'error').length) {
    const newErrors = {
      ...(existingErrors || {}),
      secret: {
        ...((existingErrors || {}).secret || {}),
        secrets: (existingErrors || {}).secrets || [],
      }
    };
    newErrors.secret.secrets[index] = { value: 'Invalid' };
    yield put(stopAsyncValidation('newJobVersion', newErrors));
  } else {
    yield put(stopAsyncValidation('newJobVersion', existingErrors));
  }
}

export function* addSecretSaga() {
  const formValues = yield select(getFormValues);
  if (!formValues.secret.newSecretSection) return;
  if (!formValues.secret.newSecretSection.newSecretName || !formValues.secret.newSecretSection.newSecretType) return;
  yield put(arrayPush('newJobVersion', 'secret.secrets', {
    key: formValues.secret.newSecretSection.newSecretName,
    value: '',
    editor: formValues.secret.newSecretSection.newSecretType
  }));
  yield put(resetSection('newJobVersion', 'secret.newSecretSection'));
}

export function* removeSecretSaga({ payload }) {
  yield put(arrayRemove('newJobVersion', 'secret.secrets', payload));
}

export default [
  takeLatest(INITIALISE, fetchNewJobVersionPageDataSaga),
  takeLatest(FETCH_JOB_SUCCESS, checkPermissionSaga),
  takeLatest(triggerPreview, previewValuesSaga),
  takeLatest(FETCH_JOB_VERSIONS_SUCCESS, previewValuesSaga),
  takeLatest(submitForm.REQUEST, submitSaga),
  takeLatest(addSecret, addSecretSaga),
  takeLatest(removeSecret, removeSecretSaga),
  takeLatest(validateAnnotations, validateAnnotationsSaga),
];
