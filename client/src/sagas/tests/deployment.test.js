import { put, call } from 'redux-saga/effects';
import {
  fetchDeploymentSaga,
  submitDeploymentNoteSaga,
} from '../deployment';

import {
  fetchDeployment,
  FETCH_DEPLOYMENT_REQUEST,
  FETCH_DEPLOYMENT_SUCCESS,
  FETCH_DEPLOYMENT_ERROR,
  submitNoteForm,
  closeModal,
} from '../../modules/deployment';

import {
  getDeployment,
  updateDeploymentNote,
} from '../../lib/api';

describe('Deployment sagas', () => {
  describe('fetch', () => {
    const payload = { match: { params: {
      deploymentId: 1,
    }}};
    it('should fetch deployment data', () => {
      const deploymentData = { a: 1 };

      const gen = fetchDeploymentSaga(fetchDeployment(payload));
      expect(gen.next().value).toMatchObject(put(FETCH_DEPLOYMENT_REQUEST()));
      expect(gen.next().value).toMatchObject(call(getDeployment, 1));
      expect(gen.next(deploymentData).value).toMatchObject(put(FETCH_DEPLOYMENT_SUCCESS({ data: deploymentData } )));
      expect(gen.next().done).toBe(true);
    });

    it('should tolerate errors fetching deployment info', () => {
      const error = new Error('ouch');
      const gen = fetchDeploymentSaga(fetchDeployment({ ...payload, quiet: true }));
      expect(gen.next().value).toMatchObject(put(FETCH_DEPLOYMENT_REQUEST()));
      expect(gen.next().value).toMatchObject(call(getDeployment, 1));
      expect(gen.throw(error).value).toMatchObject(put(FETCH_DEPLOYMENT_ERROR({ error: error.message })));
      expect(gen.next().done).toBe(true);
    });
  });

  it('should submit deployment note information', () => {
    const updatedDeployment = { a:1, note: 'abc' };
    const gen = submitDeploymentNoteSaga(submitNoteForm.request({ id: '123', note: 'abc' }));
    expect(gen.next().value).toMatchObject(call(updateDeploymentNote, '123', 'abc'));
    expect(gen.next(updatedDeployment).value).toMatchObject(put(submitNoteForm.success()));
    expect(gen.next().value).toMatchObject(put(FETCH_DEPLOYMENT_SUCCESS({ data: updatedDeployment })));
    expect(gen.next().value).toMatchObject(put(closeModal()));
    expect(gen.next().done).toBe(true);
  });
});
