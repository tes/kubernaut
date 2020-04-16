import { takeLatest, call, put, select } from 'redux-saga/effects';
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
} from '../modules/newJobVersion';
import {
  getJob,
  getJobVersions,
  getJobVersion,
  getPreviewOfJobVersion,
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

export function* previewValuesSaga() {
  try {
    const values = yield select(getFormValues);
    const data = yield call(getPreviewOfJobVersion, values);
    yield put(updatePreview(data));
  } catch (err) {
    console.error(err); // eslint-disable-line no-console
  }
}

export default [
  takeLatest(INITIALISE, fetchNewJobVersionPageDataSaga),
  takeLatest(triggerPreview, previewValuesSaga),
  takeLatest(FETCH_JOB_VERSIONS_SUCCESS, previewValuesSaga),
];
