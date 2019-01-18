import { call, put, select } from 'redux-saga/effects';
import { startSubmit, stopSubmit } from 'redux-form';
import { push, getLocation } from 'connected-react-router';
import {
  fetchServiceInfoSaga,
  fetchServiceNamespacesStatusSaga,
  updateServiceStatusSaga,
  paginationSaga,
  locationChangeSaga,
  checkPermissionSaga,
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
} from '../../modules/serviceManage';

import {
  getService,
  getServiceNamespacesStatus,
  enableServiceForNamespace,
  disableServiceForNamespace,
  getCanManageAnyNamespace,
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

      it('fetches and sets permission information', () => {
        const gen = checkPermissionSaga(initServiceManage(initPayload));
        expect(gen.next().value).toMatchObject(put(canManageRequest()));
        expect(gen.next().value).toMatchObject(call(getCanManageAnyNamespace));
        expect(gen.next({ answer: true }).value).toMatchObject(put(setCanManage(true)));
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
    expect(gen.next(paginationState).value).toMatchObject(put(push('/services/default/bob/manage?pagination=page%3D1%26limit%3D20')));
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
      expect(gen.next().value).toMatchObject(put(fetchServices()));
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
});
