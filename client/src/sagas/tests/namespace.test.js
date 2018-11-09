import { put, call, select, take } from 'redux-saga/effects';
import { push, getLocation } from 'connected-react-router';

import {
  fetchNamespaceInfoSaga,
  fetchDeploymentsForNamespaceSaga,
  paginationSaga,
  sortDeploymentsSaga,
  locationChangeSaga,
} from '../namespace';

import {
  initialiseNamespacePage,
  fetchNamespacePageData,
  fetchDeploymentsPagination,
  selectNamespace,
  selectPaginationState,
  selectSortState,
  toggleSort,
  setPagination,
  setSort,
  fetchDeployments,
  FETCH_NAMESPACE_REQUEST,
  FETCH_NAMESPACE_SUCCESS,
  FETCH_NAMESPACE_ERROR,
  FETCH_DEPLOYMENTS_REQUEST,
  FETCH_DEPLOYMENTS_SUCCESS,
  FETCH_DEPLOYMENTS_ERROR,
} from '../../modules/namespace';

import {
  getNamespace,
  getDeployments
} from '../../lib/api';

describe('Namespace sagas', () => {
  const namespaceId = 'abc';
  const initPayload = { id: namespaceId, quiet: true };
  const namespaceData = {
    name: 'abcde',
    cluster: { name: 'xyz' },
  };
  const paginationState = { page: 1, limit: 20 };
  const sortState = { column: 'name', order: 'asc' };

  describe('fetch', () => {
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
      expect(gen.next().value).toMatchObject(select(selectPaginationState));
      expect(gen.next(paginationState).value).toMatchObject(select(selectSortState));
      expect(gen.next(sortState).value).toMatchObject(select(selectNamespace));
      expect(gen.next(namespaceData).value).toMatchObject(put(FETCH_DEPLOYMENTS_REQUEST()));
      expect(gen.next().value).toMatchObject(call(getDeployments, { namespace: namespaceData.name, cluster: namespaceData.cluster.name, limit: 20, offset: 0 }));
      expect(gen.next(deploymentsData).value).toMatchObject(put(FETCH_DEPLOYMENTS_SUCCESS({ data: deploymentsData } )));
      expect(gen.next().done).toBe(true);
    });

    it('should tolerate errors fetching deployments', () => {
      const error = new Error('ouch');
      const gen = fetchDeploymentsForNamespaceSaga(fetchNamespacePageData(initPayload));
      expect(gen.next().value).toMatchObject(select(selectPaginationState));
      expect(gen.next(paginationState).value).toMatchObject(select(selectSortState));
      expect(gen.next(sortState).value).toMatchObject(select(selectNamespace));
      expect(gen.next(namespaceData).value).toMatchObject(put(FETCH_DEPLOYMENTS_REQUEST()));
      expect(gen.next().value).toMatchObject(call(getDeployments, { namespace: namespaceData.name, cluster: namespaceData.cluster.name, limit: 20, offset: 0 }));
      expect(gen.throw(error).value).toMatchObject(put(FETCH_DEPLOYMENTS_ERROR({ error: error.message })));
      expect(gen.next().done).toBe(true);
    });

    it('should fetch deployments pagination', () => {
      const deploymentsData = { count: 1, items: [{}], limit: 20, offset: 0 };

      const gen = fetchDeploymentsForNamespaceSaga(fetchDeploymentsPagination({ ...initPayload, page: 2 }));
      expect(gen.next().value).toMatchObject(select(selectPaginationState));
      expect(gen.next({ page: 2, limit: 20 }).value).toMatchObject(select(selectSortState));
      expect(gen.next(sortState).value).toMatchObject(select(selectNamespace));
      expect(gen.next(namespaceData).value).toMatchObject(put(FETCH_DEPLOYMENTS_REQUEST()));
      expect(gen.next().value).toMatchObject(call(getDeployments, { namespace: namespaceData.name, cluster: namespaceData.cluster.name, limit: 20, offset: 20 }));
      expect(gen.next(deploymentsData).value).toMatchObject(put(FETCH_DEPLOYMENTS_SUCCESS({ data: deploymentsData } )));
      expect(gen.next().done).toBe(true);
    });
  });

  it('should push pagination state to url', () => {
    const gen = paginationSaga(fetchDeploymentsPagination());
    expect(gen.next().value).toMatchObject(select(getLocation));
    expect(gen.next({ pathname: '/namespaces/bob', search: '' }).value).toMatchObject(select(selectPaginationState));
    expect(gen.next(paginationState).value).toMatchObject(put(push('/namespaces/bob?pagination=page%3D1%26limit%3D20')));
  });

  it('should push sort state to url', () => {
    const gen = sortDeploymentsSaga(toggleSort());
    expect(gen.next().value).toMatchObject(select(getLocation));
    expect(gen.next({ pathname: '/namespaces/bob', search: '' }).value).toMatchObject(select(selectSortState));
    expect(gen.next(sortState).value).toMatchObject(put(push('/namespaces/bob?sort=column%3Dname%26order%3Dasc&pagination=')));
  });

  describe('locationChangeSaga', () => {
    it('should fetch namespace info and wait for success if missing (page load)', () => {
      const location = {
        pathname: '/namespaces/bob',
        search: '',
      };
      const match = {
        params: { namespaceId: 'bob' },
      };

      const gen = locationChangeSaga(initialiseNamespacePage({ location, match }));
      expect(gen.next().value).toMatchObject(select(selectNamespace));
      expect(gen.next({}).value).toMatchObject(put(fetchNamespacePageData({ id: 'bob' })));
      expect(gen.next().value).toMatchObject(take(FETCH_NAMESPACE_SUCCESS));
      expect(gen.next().value).toMatchObject(put(setPagination({})));
      expect(gen.next().value).toMatchObject(put(setSort({})));
      expect(gen.next().value).toMatchObject(put(fetchDeployments()));
      expect(gen.next().done).toBe(true);
    });

    it('should fetch namespace info and wait for success if url id is different from store', () => {
      const location = {
        pathname: '/namespaces/bob',
        search: '',
      };

      const match = {
        params: { namespaceId: 'bob' },
      };

      const gen = locationChangeSaga(initialiseNamespacePage({ location, match }));
      expect(gen.next().value).toMatchObject(select(selectNamespace));
      expect(gen.next({ id: 'abc' }).value).toMatchObject(put(fetchNamespacePageData({ id: 'bob' })));
      expect(gen.next().value).toMatchObject(take(FETCH_NAMESPACE_SUCCESS));
      expect(gen.next().value).toMatchObject(put(setPagination({})));
      expect(gen.next().value).toMatchObject(put(setSort({})));
      expect(gen.next().value).toMatchObject(put(fetchDeployments()));
      expect(gen.next().done).toBe(true);
    });

    it('should parse and set pagination state', () => {
      const location = {
        pathname: '/namespaces/bob',
        search: '?a=b&pagination=page%3D1%26limit%3D20',
      };
      const match = {
        params: { namespaceId: 'bob' },
      };

      const gen = locationChangeSaga(initialiseNamespacePage({ location, match }));
      expect(gen.next().value).toMatchObject(select(selectNamespace));
      expect(gen.next({ id: 'bob' }).value).toMatchObject(put(setPagination({
        page: '1',
        limit: '20',
      })));
      expect(gen.next().value).toMatchObject(put(setSort({})));
      expect(gen.next().value).toMatchObject(put(fetchDeployments()));
      expect(gen.next().done).toBe(true);
    });

    it('should parse and set sort state', () => {
      const location = {
        pathname: '/namespaces/bob',
        search: '?a=b&sort=column%3Dname%26order%3Dasc&pagination=',
      };
      const match = {
        params: { namespaceId: 'bob' },
      };

      const gen = locationChangeSaga(initialiseNamespacePage({ location, match }));
      expect(gen.next().value).toMatchObject(select(selectNamespace));
      expect(gen.next({ id: 'bob' }).value).toMatchObject(put(setPagination({})));
      expect(gen.next().value).toMatchObject(put(setSort({
        column: 'name',
        order: 'asc',
      })));
      expect(gen.next().value).toMatchObject(put(fetchDeployments()));
      expect(gen.next().done).toBe(true);
    });
  });

});
