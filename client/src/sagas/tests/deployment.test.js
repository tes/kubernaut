import { put, call } from 'redux-saga/effects';
import {
  fetchDeploymentSaga,
} from '../deployment';

import {
  fetchDeployment,
  FETCH_DEPLOYMENT_REQUEST,
  FETCH_DEPLOYMENT_SUCCESS,
  FETCH_DEPLOYMENT_ERROR,
} from '../../modules/deployment';

import {
  getDeployment,
} from '../../lib/api';

describe('Deployment sagas', () => {
  it('should fetch deployment data', () => {
    const deploymentData = { a: 1 };

    const gen = fetchDeploymentSaga(fetchDeployment({ id: 1 }));
    expect(gen.next().value).toMatchObject(put(FETCH_DEPLOYMENT_REQUEST()));
    expect(gen.next().value).toMatchObject(call(getDeployment, 1));
    expect(gen.next(deploymentData).value).toMatchObject(put(FETCH_DEPLOYMENT_SUCCESS({ data: deploymentData } )));
    expect(gen.next().done).toBe(true);
  });

  it('should tolerate errors fetching deployment info', () => {
    const error = new Error('ouch');
    const gen = fetchDeploymentSaga(fetchDeployment({ id: 1, quiet: true }));
    expect(gen.next().value).toMatchObject(put(FETCH_DEPLOYMENT_REQUEST()));
    expect(gen.next().value).toMatchObject(call(getDeployment, 1));
    expect(gen.throw(error).value).toMatchObject(put(FETCH_DEPLOYMENT_ERROR({ error: error.message })));
    expect(gen.next().done).toBe(true);
  });
});
