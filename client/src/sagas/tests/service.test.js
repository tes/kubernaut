import { put, call } from 'redux-saga/effects';
import {
  initServiceDetailPageSaga,
  fetchReleasesDataSaga,
  fetchDeploymentsDataSaga,
  fetchLatestDeploymentsByNamespaceForServiceSaga,
} from '../service';

import {
  initServiceDetailPage,
  fetchDeploymentsPagination,
  fetchReleasesPagination,
  FETCH_RELEASES_REQUEST,
  FETCH_RELEASES_SUCCESS,
  FETCH_RELEASES_ERROR,
  FETCH_DEPLOYMENTS_REQUEST,
  FETCH_DEPLOYMENTS_SUCCESS,
  FETCH_DEPLOYMENTS_ERROR,
  FETCH_LATEST_DEPLOYMENTS_BY_NAMESPACE_REQUEST,
  FETCH_LATEST_DEPLOYMENTS_BY_NAMESPACE_SUCCESS,
  FETCH_LATEST_DEPLOYMENTS_BY_NAMESPACE_ERROR,
} from '../../modules/service';

import {
  getReleases,
  getDeployments,
  getLatestDeploymentsByNamespaceForService,
} from '../../lib/api';

describe('Service sagas', () => {
  describe('releases', () => {
    it('should error without required parameters', () => {
      [{}, { registry: 'a' }, { service: 'a' }].forEach(payload => {
        expect(() => fetchReleasesDataSaga(fetchReleasesPagination(payload)).next()).toThrow();
      });
    });

    it('should fetch releases', () => {
      const releasesData = { limit: 50, offset: 0, count: 3, items: [1, 2, 3] };

      const gen = fetchReleasesDataSaga(fetchReleasesPagination({ service: 'a', registry: 'b' }));
      expect(gen.next().value).toMatchObject(put(FETCH_RELEASES_REQUEST()));
      expect(gen.next().value).toMatchObject(call(getReleases, { service: 'a', registry: 'b', limit: 10, offset: 0 }));
      expect(gen.next(releasesData).value).toMatchObject(put(FETCH_RELEASES_SUCCESS({ data: releasesData } )));
      expect(gen.next().done).toBe(true);
    });

    it('should tolerate errors fetching releases', () => {
      const error = new Error('ouch');
      const gen = fetchReleasesDataSaga(fetchReleasesPagination({ service: 'a', registry: 'b', quiet: true }));
      expect(gen.next().value).toMatchObject(put(FETCH_RELEASES_REQUEST()));
      expect(gen.next().value).toMatchObject(call(getReleases, { service: 'a', registry: 'b', limit: 10, offset: 0 }));
      expect(gen.throw(error).value).toMatchObject(put(FETCH_RELEASES_ERROR({ error: error.message })));
      expect(gen.next().done).toBe(true);
    });

    it('should fetch releases pagination', () => {
      const releasesData = { limit: 50, offset: 50, count: 3, items: [1, 2, 3] };

      const gen = fetchReleasesDataSaga(fetchReleasesPagination({ service: 'a', registry: 'b', page: 2 }));
      expect(gen.next().value).toMatchObject(put(FETCH_RELEASES_REQUEST()));
      expect(gen.next().value).toMatchObject(call(getReleases, { service: 'a', registry: 'b', limit: 10, offset: 10 }));
      expect(gen.next(releasesData).value).toMatchObject(put(FETCH_RELEASES_SUCCESS({ data: releasesData } )));
      expect(gen.next().done).toBe(true);
    });
  });

  describe('deployments', () => {
    it('should error without required parameters', () => {
      [{}, { registry: 'a' }, { service: 'a' }].forEach(payload => {
        expect(() => fetchDeploymentsDataSaga(fetchDeploymentsPagination(payload)).next()).toThrow();
      });
    });

    it('should fetch deployments', () => {
      const deploymentsData = { limit: 50, offset: 0, count: 3, items: [1, 2, 3] };

      const gen = fetchDeploymentsDataSaga(fetchDeploymentsPagination({ service: 'a', registry: 'b' }));
      expect(gen.next().value).toMatchObject(put(FETCH_DEPLOYMENTS_REQUEST()));
      expect(gen.next().value).toMatchObject(call(getDeployments, { service: 'a', registry: 'b', limit: 10, offset: 0 }));
      expect(gen.next(deploymentsData).value).toMatchObject(put(FETCH_DEPLOYMENTS_SUCCESS({ data: deploymentsData } )));
      expect(gen.next().done).toBe(true);
    });

    it('should tolerate errors fetching deployments', () => {
      const error = new Error('ouch');
      const gen = fetchDeploymentsDataSaga(fetchDeploymentsPagination({ service: 'a', registry: 'b', quiet: true }));
      expect(gen.next().value).toMatchObject(put(FETCH_DEPLOYMENTS_REQUEST()));
      expect(gen.next().value).toMatchObject(call(getDeployments, { service: 'a', registry: 'b', limit: 10, offset: 0 }));
      expect(gen.throw(error).value).toMatchObject(put(FETCH_DEPLOYMENTS_ERROR({ error: error.message })));
      expect(gen.next().done).toBe(true);
    });

    it('should fetch deployments pagination', () => {
      const deploymentsData = { limit: 50, offset: 50, count: 3, items: [1, 2, 3] };

      const gen = fetchDeploymentsDataSaga(fetchDeploymentsPagination({ service: 'a', registry: 'b', page: 2 }));
      expect(gen.next().value).toMatchObject(put(FETCH_DEPLOYMENTS_REQUEST()));
      expect(gen.next().value).toMatchObject(call(getDeployments, { service: 'a', registry: 'b', limit: 10, offset: 10 }));
      expect(gen.next(deploymentsData).value).toMatchObject(put(FETCH_DEPLOYMENTS_SUCCESS({ data: deploymentsData } )));
      expect(gen.next().done).toBe(true);
    });
  });

  describe('latest deployments', () => {
    it('should error without required parameters', () => {
      [{}, { registry: 'a' }, { service: 'a' }].forEach(payload => {
        expect(() => fetchLatestDeploymentsByNamespaceForServiceSaga(fetchReleasesPagination(payload)).next()).toThrow();
      });
    });

    it('should fetch latest deployments', () => {
      const deploymentsData = { items: [1, 2, 3] };

      const gen = fetchLatestDeploymentsByNamespaceForServiceSaga(fetchReleasesPagination({ service: 'a', registry: 'b' }));
      expect(gen.next().value).toMatchObject(put(FETCH_LATEST_DEPLOYMENTS_BY_NAMESPACE_REQUEST()));
      expect(gen.next().value).toMatchObject(call(getLatestDeploymentsByNamespaceForService, { service: 'a', registry: 'b' }));
      expect(gen.next(deploymentsData).value).toMatchObject(put(FETCH_LATEST_DEPLOYMENTS_BY_NAMESPACE_SUCCESS({ data: deploymentsData } )));
      expect(gen.next().done).toBe(true);
    });

    it('should tolerate errors fetching latest deployments', () => {
      const error = new Error('ouch');
      const gen = fetchLatestDeploymentsByNamespaceForServiceSaga(fetchReleasesPagination({ service: 'a', registry: 'b', quiet: true }));
      expect(gen.next().value).toMatchObject(put(FETCH_LATEST_DEPLOYMENTS_BY_NAMESPACE_REQUEST()));
      expect(gen.next().value).toMatchObject(call(getLatestDeploymentsByNamespaceForService, { service: 'a', registry: 'b' }));
      expect(gen.throw(error).value).toMatchObject(put(FETCH_LATEST_DEPLOYMENTS_BY_NAMESPACE_ERROR({ error: error.message })));
      expect(gen.next().done).toBe(true);
    });
  });

  it('should kick off all requests on page open', () => {
    const payload = { registry: 'a', service: 'a' };
    const gen = initServiceDetailPageSaga(initServiceDetailPage(payload));
    expect(gen.next().value).toMatchObject(put(fetchReleasesPagination(payload)));
    expect(gen.next().value).toMatchObject(put(fetchDeploymentsPagination(payload)));
    expect(gen.next().done).toBe(true);
  });

});
