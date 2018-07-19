import { put, call } from 'redux-saga/effects';
import {
  fetchDeploymentsDataSaga,
} from '../deployments';

import {
  fetchDeploymentsPagination,
  FETCH_DEPLOYMENTS_REQUEST,
  FETCH_DEPLOYMENTS_SUCCESS,
  FETCH_DEPLOYMENTS_ERROR,
} from '../../modules/deployments';

import {
  getDeployments,
} from '../../lib/api';

describe('Deployments sagas', () => {
  it('should fetch deployments', () => {
    const deploymentsData = { limit: 50, offset: 0, count: 3, items: [1, 2, 3] };

    const gen = fetchDeploymentsDataSaga(fetchDeploymentsPagination());
    expect(gen.next().value).toMatchObject(put(FETCH_DEPLOYMENTS_REQUEST()));
    expect(gen.next().value).toMatchObject(call(getDeployments, { limit: 50, offset: 0 }));
    expect(gen.next(deploymentsData).value).toMatchObject(put(FETCH_DEPLOYMENTS_SUCCESS({ data: deploymentsData } )));
    expect(gen.next().done).toBe(true);
  });

  it('should tolerate errors fetching deployments', () => {
    const error = new Error('ouch');
    const gen = fetchDeploymentsDataSaga(fetchDeploymentsPagination({ quiet: true }));
    expect(gen.next().value).toMatchObject(put(FETCH_DEPLOYMENTS_REQUEST()));
    expect(gen.next().value).toMatchObject(call(getDeployments, { limit: 50, offset: 0 }));
    expect(gen.throw(error).value).toMatchObject(put(FETCH_DEPLOYMENTS_ERROR({ error: error.message })));
    expect(gen.next().done).toBe(true);
  });

  it('should fetch deployments pagination', () => {
    const deploymentsData = { limit: 50, offset: 50, count: 3, items: [1, 2, 3] };

    const gen = fetchDeploymentsDataSaga(fetchDeploymentsPagination({ page: 2 }));
    expect(gen.next().value).toMatchObject(put(FETCH_DEPLOYMENTS_REQUEST()));
    expect(gen.next().value).toMatchObject(call(getDeployments, { limit: 50, offset: 50 }));
    expect(gen.next(deploymentsData).value).toMatchObject(put(FETCH_DEPLOYMENTS_SUCCESS({ data: deploymentsData } )));
    expect(gen.next().done).toBe(true);
  });
});
