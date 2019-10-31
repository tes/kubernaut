import { call, put, select, take, race } from 'redux-saga/effects';
import { startSubmit, stopSubmit } from 'redux-form';
import { push, getLocation } from 'connected-react-router';
import {
  fetchServiceInfoSaga,
  fetchServiceNamespacesStatusSaga,
  updateServiceStatusSaga,
  paginationSaga,
  locationChangeSaga,
  checkPermissionSaga,
  fetchTeamForServiceSaga,
  fetchTeamPermissionsSaga,
  updateTeamOwnershipSaga,
  deleteServiceSaga,
} from '../serviceManage';

import {
  initServiceManage,
  updateServiceStatusForNamespace,
  selectNamespaces,
  updateServiceStatusSuccess,
  fetchServices,
  fetchNamespacesPagination,
  selectPaginationState,
  setPagination,
  FETCH_SERVICE_REQUEST,
  FETCH_SERVICE_SUCCESS,
  FETCH_SERVICE_ERROR,
  FETCH_SERVICE_NAMESPACES_STATUS_REQUEST,
  FETCH_SERVICE_NAMESPACES_STATUS_SUCCESS,
  FETCH_SERVICE_NAMESPACES_STATUS_ERROR,
  canManageRequest,
  setCanManage,
  FETCH_TEAM_REQUEST,
  FETCH_TEAM_SUCCESS,
  FETCH_TEAM_ERROR,
  fetchTeamForService,
  selectTeam,
  setCanManageTeamForService,
  setManageableTeams,
  updateTeamOwnership,
  selectServiceInfo,
  deleteService,
  closeDeleteModal,
  setCanDelete,
  canDeleteRequest,
} from '../../modules/serviceManage';

import {
  getService,
  getServiceNamespacesStatus,
  enableServiceForNamespace,
  disableServiceForNamespace,
  getCanManageAnyNamespace,
  getTeamForService,
  hasPermissionOn,
  withPermission,
  associateServiceWithTeam,
  disassociateService,
  getCanManageAnyTeam,
  deleteService as deleteServiceRequest,
} from '../../lib/api';

describe('ServiceManageSagas', () => {
  const namespaceId = 'abc';
  const service = 'bob';
  const registry = 'default';
  const match = { params: { registry, name: service } };
  const paginationState = { page: 1, limit: 20 };

  describe('fetch', () => {
    describe('service info', () => {
      const initPayload = { match, quiet: true };
      it('should fetch service info', () => {
        const serviceData = { name: 'bob', id: 123 };

        const gen = fetchServiceInfoSaga(initServiceManage(initPayload));
        expect(gen.next().value).toMatchObject(put(FETCH_SERVICE_REQUEST()));
        expect(gen.next().value).toMatchObject(call(getService, { registry, service }));
        expect(gen.next(serviceData).value).toMatchObject(put(FETCH_SERVICE_SUCCESS({ data: serviceData } )));
        expect(gen.next().done).toBe(true);
      });

      it('should tolerate errors fetching service info', () => {
        const error = new Error('ouch');
        const gen = fetchServiceInfoSaga(initServiceManage(initPayload));
        expect(gen.next().value).toMatchObject(put(FETCH_SERVICE_REQUEST()));
        expect(gen.next().value).toMatchObject(call(getService, { registry, service }));
        expect(gen.throw(error).value).toMatchObject(put(FETCH_SERVICE_ERROR({ error: error.message })));
        expect(gen.next().done).toBe(true);
      });
    });

    describe('check permission', () => {
      const initPayload = { match, quiet: true };
      const service = { id: 'abc', registry: { id: '000' }};

      it('fetches and sets permission information', () => {
        const gen = checkPermissionSaga(initServiceManage(initPayload));
        expect(gen.next().value).toMatchObject(put(canManageRequest()));
        expect(gen.next().value).toMatchObject(put(canDeleteRequest()));
        expect(gen.next().value).toMatchObject(race({
          success: take(FETCH_SERVICE_SUCCESS),
          failure: take(FETCH_SERVICE_ERROR),
        }));
        expect(gen.next({ success: { payload: { data: service } } }).value).toMatchObject(call(getCanManageAnyNamespace));
        expect(gen.next({ answer: true }).value).toMatchObject(put(setCanManage(true)));
        expect(gen.next().value).toMatchObject(call(hasPermissionOn, 'registries-write', 'registry', '000'));
        expect(gen.next({ answer: true }).value).toMatchObject(put(setCanDelete(true)));
        expect(gen.next().done).toBe(true);
      });

      it('should bail accordingly if service fetch error occurs', () => {
        const gen = checkPermissionSaga(initServiceManage(initPayload));
        expect(gen.next().value).toMatchObject(put(canManageRequest()));
        expect(gen.next().value).toMatchObject(put(canDeleteRequest()));
        expect(gen.next().value).toMatchObject(race({
          success: take(FETCH_SERVICE_SUCCESS),
          failure: take(FETCH_SERVICE_ERROR),
        }));
        expect(gen.next({ failure: {}}).value).toMatchObject(put(setCanManage(false)));
        expect(gen.next().value).toMatchObject(put(setCanDelete(false)));
        expect(gen.next().done).toBe(true);
      });
    });

    describe('fetch namespaces', () => {
      const initPayload = { registry, name: service, quiet: true };
      it('should fetch namespaces', () => {
        const namespaceData = { count: 3, items: [1,2,3] };

        const gen = fetchServiceNamespacesStatusSaga(initServiceManage(initPayload));
        expect(gen.next().value).toMatchObject(select(selectPaginationState));
        expect(gen.next(paginationState).value).toMatchObject(put(FETCH_SERVICE_NAMESPACES_STATUS_REQUEST()));
        expect(gen.next().value).toMatchObject(call(getServiceNamespacesStatus, registry, service, 0, 20));
        expect(gen.next(namespaceData).value).toMatchObject(put(FETCH_SERVICE_NAMESPACES_STATUS_SUCCESS({ data: namespaceData } )));
        expect(gen.next().done).toBe(true);
      });

      it('should fetch namespaces with pagination', () => {
        const namespaceData = { count: 3, items: [1,2,3] };
        const payload = { ...initPayload, page: 2, limit: 5 };
        const gen = fetchServiceNamespacesStatusSaga(fetchNamespacesPagination(payload));
        expect(gen.next().value).toMatchObject(select(selectPaginationState));
        expect(gen.next({ page: 2, limit: 5 }).value).toMatchObject(put(FETCH_SERVICE_NAMESPACES_STATUS_REQUEST()));
        expect(gen.next().value).toMatchObject(call(getServiceNamespacesStatus, registry, service, 5, 5));
        expect(gen.next(namespaceData).value).toMatchObject(put(FETCH_SERVICE_NAMESPACES_STATUS_SUCCESS({ data: namespaceData } )));
        expect(gen.next().done).toBe(true);
      });

      it('should tolerate errors fetching namespaces', () => {
        const error = new Error('ouch');
        const gen = fetchServiceNamespacesStatusSaga(initServiceManage(initPayload));
        expect(gen.next().value).toMatchObject(select(selectPaginationState));
        expect(gen.next(paginationState).value).toMatchObject(put(FETCH_SERVICE_NAMESPACES_STATUS_REQUEST()));
        expect(gen.next().value).toMatchObject(call(getServiceNamespacesStatus, registry, service, 0, 20));
        expect(gen.throw(error).value).toMatchObject(put(FETCH_SERVICE_NAMESPACES_STATUS_ERROR({ error: error.message })));
        expect(gen.next().done).toBe(true);
      });
    });
  });

  it('should push pagination state to url', () => {
    const gen = paginationSaga(fetchNamespacesPagination());
    expect(gen.next().value).toMatchObject(select(getLocation));
    expect(gen.next({ pathname: '/services/default/bob/manage', search: '' }).value).toMatchObject(select(selectPaginationState));
    expect(gen.next(paginationState).value).toMatchObject(put(push('/services/default/bob/manage?pagination=limit%3D20%26page%3D1')));
  });

  describe('locationChangeSaga', () => {
    it('should parse and set pagination state', () => {
      const location = {
        pathname: '/services/default/bob/manage',
        search: '?a=b&pagination=page%3D1%26limit%3D20',
      };

      const gen = locationChangeSaga(initServiceManage({ location, match: { params: { registry: 'default', name: 'bob' } } }));
      expect(gen.next().value).toMatchObject(put(setPagination({
        page: '1',
        limit: '20',
      })));
      expect(gen.next().value).toMatchObject(put(fetchServices({ registry: 'default', name: 'bob' })));
      expect(gen.next().value).toMatchObject(put(fetchTeamForService({ registry: 'default', service: 'bob'})));
      expect(gen.next().done).toBe(true);
    });
  });

  describe('should update service status for namespace', () => {
    it('should enable a service for a namespace', () => {
      const payload = {
        namespaceId,
        serviceId: 123,
        newValue: true,
        quiet: true,
      };
      const gen = updateServiceStatusSaga(updateServiceStatusForNamespace(payload));
      expect(gen.next().value).toMatchObject(select(selectNamespaces));
      expect(gen.next({ offset: 0, limit: 10 }).value).toMatchObject(put(startSubmit('serviceManage')));
      expect(gen.next().value).toMatchObject(call(enableServiceForNamespace, namespaceId, payload.serviceId, 0, 10, true));
      expect(gen.next({ a: 1 }).value).toMatchObject(put(updateServiceStatusSuccess({ data: { a: 1 } })));
      expect(gen.next().value).toMatchObject(put(stopSubmit('serviceManage')));
      expect(gen.next().done).toBe(true);
    });

    it('should disable a service for a namespace', () => {
      const payload = {
        namespaceId,
        serviceId: 123,
        newValue: false,
        quiet: true,
      };
      const gen = updateServiceStatusSaga(updateServiceStatusForNamespace(payload));
      expect(gen.next().value).toMatchObject(select(selectNamespaces));
      expect(gen.next({ offset: 0, limit: 10 }).value).toMatchObject(put(startSubmit('serviceManage')));
      expect(gen.next().value).toMatchObject(call(disableServiceForNamespace, namespaceId, payload.serviceId, 0, 10, true));
      expect(gen.next({ a: 1 }).value).toMatchObject(put(updateServiceStatusSuccess({ data: { a: 1 } })));
      expect(gen.next().value).toMatchObject(put(stopSubmit('serviceManage')));
      expect(gen.next().done).toBe(true);
    });

    it('should handle an error updating status of service for a namespace', () => {
      const payload = {
        namespaceId,
        serviceId: 123,
        newValue: true,
        quiet: true,
      };
      const err = new Error('ouch');

      const gen = updateServiceStatusSaga(updateServiceStatusForNamespace(payload));
      expect(gen.next().value).toMatchObject(select(selectNamespaces));
      expect(gen.next({ offset: 0, limit: 10 }).value).toMatchObject(put(startSubmit('serviceManage')));
      expect(gen.next().value).toMatchObject(call(enableServiceForNamespace, namespaceId, payload.serviceId, 0, 10, true));
      expect(gen.throw(err).value).toMatchObject(put(stopSubmit('serviceManage')));
      expect(gen.next().done).toBe(true);
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
      expect(gen.next().done).toBe(true);
    });

    it('should fetch team permission and other manageable teams (when service has a team)', () => {
      const team = { id: 'abc' };
      const manageable = [1,2,3];

      const gen = fetchTeamPermissionsSaga(FETCH_TEAM_REQUEST());
      expect(gen.next().value).toMatchObject(race({
        success: take(FETCH_TEAM_SUCCESS),
        failure: take(FETCH_TEAM_ERROR),
      }));
      expect(gen.next({ success: {} }).value).toMatchObject(select(selectTeam));
      expect(gen.next(team).value).toMatchObject(call(hasPermissionOn, 'teams-manage', 'team', team.id));
      expect(gen.next({ answer: true }).value).toMatchObject(put(setCanManageTeamForService(true)));
      expect(gen.next().value).toMatchObject(call(withPermission, 'teams-manage', 'team'));
      expect(gen.next(manageable).value).toMatchObject(put(setManageableTeams(manageable)));
      expect(gen.next().done).toBe(true);
    });

    it('should fetch team permission & stop if lacking permission on current services\' team (when service has a team)', () => {
      const team = { id: 'abc' };

      const gen = fetchTeamPermissionsSaga(FETCH_TEAM_REQUEST());
      expect(gen.next().value).toMatchObject(race({
        success: take(FETCH_TEAM_SUCCESS),
        failure: take(FETCH_TEAM_ERROR),
      }));
      expect(gen.next({ success: {} }).value).toMatchObject(select(selectTeam));
      expect(gen.next(team).value).toMatchObject(call(hasPermissionOn, 'teams-manage', 'team', team.id));
      expect(gen.next({ answer: false }).value).toMatchObject(put(setCanManageTeamForService(false)));
      expect(gen.next().done).toBe(true);
    });

    it('should fetch team permission and other manageable teams (when service has no team)', () => {
      const manageable = [1,2,3];

      const gen = fetchTeamPermissionsSaga(FETCH_TEAM_REQUEST());
      expect(gen.next().value).toMatchObject(race({
        success: take(FETCH_TEAM_SUCCESS),
        failure: take(FETCH_TEAM_ERROR),
      }));
      expect(gen.next({ failure: {} }).value).toMatchObject(call(getCanManageAnyTeam));
      expect(gen.next({ answer: true }).value).toMatchObject(put(setCanManageTeamForService(true)));
      expect(gen.next().value).toMatchObject(call(withPermission, 'teams-manage', 'team'));
      expect(gen.next(manageable).value).toMatchObject(put(setManageableTeams(manageable)));
      expect(gen.next().done).toBe(true);
    });

    it('should fetch team permission & stop if lacking permission on current services\' team (when service has no team)', () => {
      const gen = fetchTeamPermissionsSaga(FETCH_TEAM_REQUEST());
      expect(gen.next().value).toMatchObject(race({
        success: take(FETCH_TEAM_SUCCESS),
        failure: take(FETCH_TEAM_ERROR),
      }));
      expect(gen.next({ failure: {} }).value).toMatchObject(call(getCanManageAnyTeam));
      expect(gen.next({ answer: false }).value).toMatchObject(put(setCanManageTeamForService(false)));
      expect(gen.next().done).toBe(true);
    });

    it('should update team ownership with new team', () => {
      const serviceId = 'abc';
      const registry = 'default';
      const service = 'bob';
      const newTeam = 'team-123';
      const payload = { value: newTeam };

      const gen = updateTeamOwnershipSaga(updateTeamOwnership(payload));
      expect(gen.next().value).toMatchObject(select(selectServiceInfo));
      expect(gen.next({ id: serviceId, registry, service }).value).toMatchObject(call(associateServiceWithTeam, serviceId, newTeam));
      expect(gen.next().value).toMatchObject(put(fetchTeamForService({ registry, service })));
      expect(gen.next().done).toBe(true);
    });

    it('should update team ownership with no team association', () => {
      const serviceId = 'abc';
      const registry = 'default';
      const service = 'bob';
      const newTeam = '';
      const payload = { value: newTeam };

      const gen = updateTeamOwnershipSaga(updateTeamOwnership(payload));
      expect(gen.next().value).toMatchObject(select(selectServiceInfo));
      expect(gen.next({ id: serviceId, registry, service }).value).toMatchObject(call(disassociateService, serviceId));
      expect(gen.next().value).toMatchObject(put(fetchTeamForService({ registry, service })));
      expect(gen.next().done).toBe(true);
    });
  });

  describe('deleteServiceSaga', () => {
    it('should delete a service', () => {
      const service = { registry: 'abc', service: 'def' };
      const gen = deleteServiceSaga(deleteService);
      expect(gen.next().value).toMatchObject(select(selectServiceInfo));
      expect(gen.next(service).value).toMatchObject(call(deleteServiceRequest, 'abc', 'def'));
      expect(gen.next().value).toMatchObject(put(closeDeleteModal()));
      expect(gen.next().value).toMatchObject(put(push('/services')));
      expect(gen.next().done).toBe(true);
    });
  });
});
