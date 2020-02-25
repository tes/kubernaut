import { put, call, select, take } from 'redux-saga/effects';
import { replace } from 'connected-react-router';
import {
  initServiceStatusPageSaga,
  fetchLatestDeploymentsByNamespaceForServiceSaga,
  canManageSaga,
  fetchTeamForServiceSaga,
  fetchStatusSaga,
} from '../serviceStatus';

import {
  initServiceStatusPage,
  fetchLatestDeployments,
  fetchStatus,
  setCanManage,
  FETCH_LATEST_DEPLOYMENTS_BY_NAMESPACE_REQUEST,
  FETCH_LATEST_DEPLOYMENTS_BY_NAMESPACE_SUCCESS,
  FETCH_LATEST_DEPLOYMENTS_BY_NAMESPACE_ERROR,
  FETCH_STATUS_REQUEST,
  FETCH_STATUS_SUCCESS,
  FETCH_STATUS_ERROR,
  fetchTeamForService,
  FETCH_TEAM_REQUEST,
  FETCH_TEAM_SUCCESS,
  selectLatestDeployments,
} from '../../modules/serviceStatus';

import {
  getLatestDeploymentsByNamespaceForService,
  getCanManageAnyNamespace,
  getTeamForService,
  getStatusForService,
} from '../../lib/api';

describe('Service sagas', () => {
  describe('latest deployments', () => {
    it('should error without required parameters', () => {
      [{}, { registry: 'a' }, { service: 'a' }].forEach(payload => {
        expect(() => fetchLatestDeploymentsByNamespaceForServiceSaga(fetchLatestDeployments(payload)).next()).toThrow();
      });
    });

    it('should fetch latest deployments', () => {
      const deploymentsData = { items: [1, 2, 3] };

      const gen = fetchLatestDeploymentsByNamespaceForServiceSaga(fetchLatestDeployments({ service: 'a', registry: 'b' }));
      expect(gen.next().value).toMatchObject(put(FETCH_LATEST_DEPLOYMENTS_BY_NAMESPACE_REQUEST()));
      expect(gen.next().value).toMatchObject(call(getLatestDeploymentsByNamespaceForService, { service: 'a', registry: 'b' }));
      expect(gen.next(deploymentsData).value).toMatchObject(put(FETCH_LATEST_DEPLOYMENTS_BY_NAMESPACE_SUCCESS({ data: deploymentsData } )));
      expect(gen.next().done).toBe(true);
    });

    it('should tolerate errors fetching latest deployments', () => {
      const error = new Error('ouch');
      const gen = fetchLatestDeploymentsByNamespaceForServiceSaga(fetchLatestDeployments({ service: 'a', registry: 'b', quiet: true }));
      expect(gen.next().value).toMatchObject(put(FETCH_LATEST_DEPLOYMENTS_BY_NAMESPACE_REQUEST()));
      expect(gen.next().value).toMatchObject(call(getLatestDeploymentsByNamespaceForService, { service: 'a', registry: 'b' }));
      expect(gen.throw(error).value).toMatchObject(put(FETCH_LATEST_DEPLOYMENTS_BY_NAMESPACE_ERROR({ error: error.message })));
      expect(gen.next().done).toBe(true);
    });
  });

  describe('fetch status saga', () => {
    it('should fetch status', () => {
      const data = { items: [1, 2, 3] };

      const gen = fetchStatusSaga(fetchStatus({ service: 'a', registry: 'b', namespaceId: 'abc' }));
      expect(gen.next().value).toMatchObject(put(FETCH_STATUS_REQUEST()));
      expect(gen.next().value).toMatchObject(call(getStatusForService, { service: 'a', registry: 'b' }));
      expect(gen.next(data).value).toMatchObject(put(FETCH_STATUS_SUCCESS({ data } )));
      expect(gen.next().done).toBe(true);
    });

    it('should tolerate errors fetching latest deployments', () => {
      const error = new Error('ouch');
      const gen = fetchStatusSaga(fetchStatus({ service: 'a', registry: 'b', namespaceId: 'abc', quiet: true }));
      expect(gen.next().value).toMatchObject(put(FETCH_STATUS_REQUEST()));
      expect(gen.next().value).toMatchObject(call(getStatusForService, { service: 'a', registry: 'b' }));
      expect(gen.throw(error).value).toMatchObject(put(FETCH_STATUS_ERROR()));
      expect(gen.next().done).toBe(true);
    });
  });

  describe('page init', () => {
    it('should notice if no namespace selected and select the first in the list', () => {
      const initPayload = {
        match: { params: { registry: 'a', name: 'b' } },
        location: { pathname: '/services/a/b/status' },
      };

      const gen = initServiceStatusPageSaga(initServiceStatusPage(initPayload));
      expect(gen.next().value).toMatchObject(put(fetchLatestDeployments({ registry: 'a', service: 'b'})));
      expect(gen.next().value).toMatchObject(take(FETCH_LATEST_DEPLOYMENTS_BY_NAMESPACE_SUCCESS));
      expect(gen.next().value).toMatchObject(select(selectLatestDeployments));
      expect(gen.next([{ id: 'abc' }]).value).toMatchObject(put(replace('/services/a/b/status/abc')));
      expect(gen.next().done).toBe(true);
    });

    it('should trigger necessary actions to init the page', () => {
      const initPayload = {
        match: { params: { registry: 'a', name: 'b', namespaceId: 'abc' } },
        location: { pathname: '/services/a/b/status/abc' },
      };

      const gen = initServiceStatusPageSaga(initServiceStatusPage(initPayload));
      expect(gen.next().value).toMatchObject(put(fetchLatestDeployments({ registry: 'a', service: 'b'})));
      expect(gen.next().value).toMatchObject(put(fetchStatus({ registry: 'a', service: 'b', namespaceId: 'abc'})));
      expect(gen.next().done).toBe(true);
    });

  });

  describe('Can manage', () => {
    it('should fetch and set can manage status', () => {
      const gen = canManageSaga(initServiceStatusPage());
      expect(gen.next().value).toMatchObject(call(getCanManageAnyNamespace));
      expect(gen.next({ answer: true }).value).toMatchObject(put(setCanManage(true)));
    });
  });

  describe('Team', () => {
    it('should fetch team info for a service', () => {
      const registry = 'default';
      const service = 'bob';
      const team = { name: 'abc', services: [{ name: service }]};

      const gen = fetchTeamForServiceSaga(fetchTeamForService({ registry, service }));
      expect(gen.next().value).toMatchObject(put(FETCH_TEAM_REQUEST()));
      expect(gen.next().value).toMatchObject(call(getTeamForService, { registry, service}));
      expect(gen.next(team).value).toMatchObject(put(FETCH_TEAM_SUCCESS({ data: team })));
    });
  });
});
