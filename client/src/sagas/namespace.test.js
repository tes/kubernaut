import { put, call } from 'redux-saga/effects';
import {
  fetchNamespaceInfoSaga,
  fetchDeploymentsForNamespaceSaga,
} from './namespace';

import {
  fetchNamespacePageData,
  fetchDeploymentsPagination,
  FETCH_NAMESPACE_REQUEST,
  FETCH_NAMESPACE_SUCCESS,
  FETCH_NAMESPACE_ERROR,
  FETCH_DEPLOYMENTS_REQUEST,
  FETCH_DEPLOYMENTS_SUCCESS,
  FETCH_DEPLOYMENTS_ERROR,
} from '../modules/namespace';

import {
  getNamespace,
  fetchDeployments
} from '../lib/api';

describe('Namespace sagas', () => {
  const namespaceId = 'abc';
  const initPayload = { id: namespaceId, quiet: true };

  it('should fetch namespace info', () => {
    const namespaceData = { name: 'bob', id: namespaceId, attributes: {} };

    const gen = fetchNamespaceInfoSaga(fetchNamespacePageData(initPayload));
    expect(gen.next().value).toMatchObject(put(FETCH_NAMESPACE_REQUEST()));
    expect(gen.next().value).toMatchObject(call(getNamespace, namespaceId));
    expect(gen.next(namespaceData).value).toMatchObject(put(FETCH_NAMESPACE_SUCCESS({ data: namespaceData } )));
    expect(gen.next().done).toBe(true);
  });

  it('should tolerate errors fetching namespace info', () => {
    const error = new Error('ouch');
    const gen = fetchNamespaceInfoSaga(fetchNamespacePageData(initPayload));
    expect(gen.next().value).toMatchObject(put(FETCH_NAMESPACE_REQUEST()));
    expect(gen.next().value).toMatchObject(call(getNamespace, namespaceId));
    expect(gen.throw(error).value).toMatchObject(put(FETCH_NAMESPACE_ERROR({ error: error.message })));
    expect(gen.next().done).toBe(true);
  });

  it('should fetch deployments', () => {
    const deploymentsData = { count: 1, items: [{}], limit: 20, offset: 0 };

    const gen = fetchDeploymentsForNamespaceSaga(fetchNamespacePageData(initPayload));
    expect(gen.next().value).toMatchObject(put(FETCH_DEPLOYMENTS_REQUEST()));
    expect(gen.next().value).toMatchObject(call(fetchDeployments, { namespace: namespaceId }));
    expect(gen.next(deploymentsData).value).toMatchObject(put(FETCH_DEPLOYMENTS_SUCCESS({ data: deploymentsData } )));
    expect(gen.next().done).toBe(true);
  });

  it('should tolerate errors fetching deployments', () => {
    const error = new Error('ouch');
    const gen = fetchDeploymentsForNamespaceSaga(fetchNamespacePageData(initPayload));
    expect(gen.next().value).toMatchObject(put(FETCH_DEPLOYMENTS_REQUEST()));
    expect(gen.next().value).toMatchObject(call(fetchDeployments, { namespace: namespaceId }));
    expect(gen.throw(error).value).toMatchObject(put(FETCH_DEPLOYMENTS_ERROR({ error: error.message })));
    expect(gen.next().done).toBe(true);
  });

  it('should fetch deployments pagination', () => {
    const deploymentsData = { count: 1, items: [{}], limit: 20, offset: 0 };

    const gen = fetchDeploymentsForNamespaceSaga(fetchDeploymentsPagination({ ...initPayload, page: 2 }));
    expect(gen.next().value).toMatchObject(put(FETCH_DEPLOYMENTS_REQUEST()));
    expect(gen.next().value).toMatchObject(call(fetchDeployments, { namespace: namespaceId }));
    expect(gen.next(deploymentsData).value).toMatchObject(put(FETCH_DEPLOYMENTS_SUCCESS({ data: deploymentsData } )));
    expect(gen.next().done).toBe(true);
  });
});
