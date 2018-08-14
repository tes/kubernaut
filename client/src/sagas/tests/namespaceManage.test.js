import { call, put, all, select } from 'redux-saga/effects';
import { startSubmit, stopSubmit } from 'redux-form';
import {
  initialiseSaga,
  fetchNamespaceInfoSaga,
  fetchServicesWithNamespaceStatusSaga,
  updateServiceStatusSaga,
} from '../namespaceManage';

import {
  initialise,
  updateServiceStatusForNamespace,
  selectServices,
  updateServiceStatusSuccess,
  fetchServicesPagination,
  FETCH_NAMESPACE_REQUEST,
  FETCH_NAMESPACE_SUCCESS,
  FETCH_NAMESPACE_ERROR,
  FETCH_SERVICES_NAMESPACE_STATUS_REQUEST,
  FETCH_SERVICES_NAMESPACE_STATUS_SUCCESS,
  FETCH_SERVICES_NAMESPACE_STATUS_ERROR,
} from '../../modules/namespaceManage';

import {
  getNamespace,
  getServicesWithStatusForNamespace,
  enableServiceForNamespace,
  disableServiceForNamespace,
} from '../../lib/api';

describe.only('NamespaceManageSagas', () => {
  it('should initialise the page', () => {
    const initAction = initialise({ id: 1 });
    const gen = initialiseSaga(initAction);
    expect(gen.next().value).toMatchObject(all([
      call(fetchNamespaceInfoSaga, initAction),
      call(fetchServicesWithNamespaceStatusSaga, initAction),
    ]));
  });

  const namespaceId = 'abc';
  const initPayload = { id: namespaceId, quiet: true };

  it('should fetch namespace info', () => {
    const namespaceData = { name: 'bob', id: namespaceId, attributes: {} };

    const gen = fetchNamespaceInfoSaga(initialise(initPayload));
    expect(gen.next().value).toMatchObject(put(FETCH_NAMESPACE_REQUEST()));
    expect(gen.next().value).toMatchObject(call(getNamespace, namespaceId));
    expect(gen.next(namespaceData).value).toMatchObject(put(FETCH_NAMESPACE_SUCCESS({ data: namespaceData } )));
    expect(gen.next().done).toBe(true);
  });

  it('should tolerate errors fetching namespace info', () => {
    const error = new Error('ouch');
    const gen = fetchNamespaceInfoSaga(initialise(initPayload));
    expect(gen.next().value).toMatchObject(put(FETCH_NAMESPACE_REQUEST()));
    expect(gen.next().value).toMatchObject(call(getNamespace, namespaceId));
    expect(gen.throw(error).value).toMatchObject(put(FETCH_NAMESPACE_ERROR({ error: error.message })));
    expect(gen.next().done).toBe(true);
  });

  it('should fetch services', () => {
    const namespaceData = { name: 'bob', id: namespaceId, attributes: {} };

    const gen = fetchServicesWithNamespaceStatusSaga(initialise(initPayload));
    expect(gen.next().value).toMatchObject(put(FETCH_SERVICES_NAMESPACE_STATUS_REQUEST()));
    expect(gen.next().value).toMatchObject(call(getServicesWithStatusForNamespace, namespaceId, 0, 20));
    expect(gen.next(namespaceData).value).toMatchObject(put(FETCH_SERVICES_NAMESPACE_STATUS_SUCCESS({ data: namespaceData } )));
    expect(gen.next().done).toBe(true);
  });

  it('should fetch services with pagination', () => {
    const namespaceData = { name: 'bob', id: namespaceId, attributes: {} };
    const payload = { ...initPayload, page: 2, limit: 5 };
    const gen = fetchServicesWithNamespaceStatusSaga(fetchServicesPagination(payload));
    expect(gen.next().value).toMatchObject(put(FETCH_SERVICES_NAMESPACE_STATUS_REQUEST()));
    expect(gen.next().value).toMatchObject(call(getServicesWithStatusForNamespace, namespaceId, 5, 5));
    expect(gen.next(namespaceData).value).toMatchObject(put(FETCH_SERVICES_NAMESPACE_STATUS_SUCCESS({ data: namespaceData } )));
    expect(gen.next().done).toBe(true);
  });

  it('should tolerate errors fetching services', () => {
    const error = new Error('ouch');
    const gen = fetchServicesWithNamespaceStatusSaga(initialise(initPayload));
    expect(gen.next().value).toMatchObject(put(FETCH_SERVICES_NAMESPACE_STATUS_REQUEST()));
    expect(gen.next().value).toMatchObject(call(getServicesWithStatusForNamespace, namespaceId, 0, 20));
    expect(gen.throw(error).value).toMatchObject(put(FETCH_SERVICES_NAMESPACE_STATUS_ERROR({ error: error.message })));
    expect(gen.next().done).toBe(true);
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
      expect(gen.next().value).toMatchObject(select(selectServices));
      expect(gen.next({ offset: 0, limit: 10 }).value).toMatchObject(put(startSubmit('namespaceManage')));
      expect(gen.next().value).toMatchObject(call(enableServiceForNamespace, namespaceId, payload.serviceId, 0, 10));
      expect(gen.next({ a: 1 }).value).toMatchObject(put(updateServiceStatusSuccess({ data: { a: 1 } })));
      expect(gen.next().value).toMatchObject(put(stopSubmit('namespaceManage')));
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
      expect(gen.next().value).toMatchObject(select(selectServices));
      expect(gen.next({ offset: 0, limit: 10 }).value).toMatchObject(put(startSubmit('namespaceManage')));
      expect(gen.next().value).toMatchObject(call(disableServiceForNamespace, namespaceId, payload.serviceId, 0, 10));
      expect(gen.next({ a: 1 }).value).toMatchObject(put(updateServiceStatusSuccess({ data: { a: 1 } })));
      expect(gen.next().value).toMatchObject(put(stopSubmit('namespaceManage')));
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
      expect(gen.next().value).toMatchObject(select(selectServices));
      expect(gen.next({ offset: 0, limit: 10 }).value).toMatchObject(put(startSubmit('namespaceManage')));
      expect(gen.next().value).toMatchObject(call(enableServiceForNamespace, namespaceId, payload.serviceId, 0, 10));
      expect(gen.throw(err).value).toMatchObject(put(stopSubmit('namespaceManage')));
      expect(gen.next().done).toBe(true);
    });
  });
});
