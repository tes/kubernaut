import { call, put, select } from 'redux-saga/effects';
import { push, getLocation } from 'connected-react-router';
import {
  fetchNamespaceInfoSaga,
  fetchVersionsSaga,
  paginationSaga,
  locationChangeSaga,
  checkPermissionSaga,
} from '../secretOverview';

import {
  initSecretOverview,
  fetchVersionsPagination,
  selectPaginationState,
  setPagination,
  FETCH_NAMESPACE_REQUEST,
  FETCH_NAMESPACE_SUCCESS,
  FETCH_NAMESPACE_ERROR,
  FETCH_VERSIONS_REQUEST,
  FETCH_VERSIONS_SUCCESS,
  FETCH_VERSIONS_ERROR,
  fetchVersions,
  canManageRequest,
  setCanManage,
} from '../../modules/secretOverview';

import {
  getNamespace,
  hasPermissionOn,
  getSecretVersions,
} from '../../lib/api';

describe('secretOverview sagas', () => {
  const namespaceId = 'abc';
  const service = 'bob';
  const registry = 'default';
  const match = { params: { registry, name: service, namespaceId } };
  const paginationState = { page: 1, limit: 20 };

  describe('fetch', () => {
    describe('namespace info', () => {
      const initPayload = { match, quiet: true };
      it('should fetch namespace info', () => {
        const namespaceData = { name: 'bob', id: 123 };

        const gen = fetchNamespaceInfoSaga(initSecretOverview(initPayload));
        expect(gen.next().value).toMatchObject(put(FETCH_NAMESPACE_REQUEST()));
        expect(gen.next().value).toMatchObject(call(getNamespace, namespaceId));
        expect(gen.next(namespaceData).value).toMatchObject(put(FETCH_NAMESPACE_SUCCESS({ data: namespaceData } )));
        expect(gen.next().done).toBe(true);
      });

      it('should tolerate errors fetching service info', () => {
        const error = new Error('ouch');
        const gen = fetchNamespaceInfoSaga(initSecretOverview(initPayload));
        expect(gen.next().value).toMatchObject(put(FETCH_NAMESPACE_REQUEST()));
        expect(gen.next().value).toMatchObject(call(getNamespace, namespaceId));
        expect(gen.throw(error).value).toMatchObject(put(FETCH_NAMESPACE_ERROR({ error: error.message })));
        expect(gen.next().done).toBe(true);
      });
    });

    describe('check permission', () => {
      const initPayload = { match, quiet: true };

      it('fetches and sets permission information', () => {
        const gen = checkPermissionSaga(initSecretOverview(initPayload));
        expect(gen.next().value).toMatchObject(put(canManageRequest()));
        expect(gen.next().value).toMatchObject(call(hasPermissionOn,'secrets-manage', 'namespace', namespaceId));
        expect(gen.next({ answer: true }).value).toMatchObject(put(setCanManage(true)));
        expect(gen.next().done).toBe(true);
      });
    });

    describe('fetch versions', () => {
      const initPayload = { ...match.params, quiet: true };
      it('should fetch versions', () => {
        const versionsData = { count: 3, items: [1,2,3] };

        const gen = fetchVersionsSaga(initSecretOverview(initPayload));
        expect(gen.next().value).toMatchObject(select(selectPaginationState));
        expect(gen.next(paginationState).value).toMatchObject(put(FETCH_VERSIONS_REQUEST()));
        expect(gen.next().value).toMatchObject(call(getSecretVersions, registry, service, namespaceId, 0, 20));
        expect(gen.next(versionsData).value).toMatchObject(put(FETCH_VERSIONS_SUCCESS({ data: versionsData } )));
        expect(gen.next().done).toBe(true);
      });

      it('should fetch versions with pagination', () => {
        const versionsData = { count: 3, items: [1,2,3] };
        const payload = { ...initPayload, page: 2, limit: 5 };
        const gen = fetchVersionsSaga(fetchVersionsPagination(payload));
        expect(gen.next().value).toMatchObject(select(selectPaginationState));
        expect(gen.next({ page: 2, limit: 5 }).value).toMatchObject(put(FETCH_VERSIONS_REQUEST()));
        expect(gen.next().value).toMatchObject(call(getSecretVersions, registry, service, namespaceId, 5, 5));
        expect(gen.next(versionsData).value).toMatchObject(put(FETCH_VERSIONS_SUCCESS({ data: versionsData } )));
        expect(gen.next().done).toBe(true);
      });

      it('should tolerate errors fetching versions', () => {
        const error = new Error('ouch');
        const gen = fetchVersionsSaga(initSecretOverview(initPayload));
        expect(gen.next().value).toMatchObject(select(selectPaginationState));
        expect(gen.next(paginationState).value).toMatchObject(put(FETCH_VERSIONS_REQUEST()));
        expect(gen.next().value).toMatchObject(call(getSecretVersions, registry, service, namespaceId, 0, 20));
        expect(gen.throw(error).value).toMatchObject(put(FETCH_VERSIONS_ERROR({ error: error.message })));
        expect(gen.next().done).toBe(true);
      });
    });
  });

  it('should push pagination state to url', () => {
    const gen = paginationSaga(fetchVersionsPagination());
    expect(gen.next().value).toMatchObject(select(getLocation));
    expect(gen.next({ pathname: '/services/default/bob/manage/secrets/abc', search: '' }).value).toMatchObject(select(selectPaginationState));
    expect(gen.next(paginationState).value).toMatchObject(put(push('/services/default/bob/manage/secrets/abc?pagination=page%3D1%26limit%3D20')));
  });

  describe('locationChangeSaga', () => {
    it('should parse and set pagination state', () => {
      const location = {
        pathname: '/services/default/bob/manage/secrets/abc',
        search: '?a=b&pagination=page%3D1%26limit%3D20',
      };

      const gen = locationChangeSaga(initSecretOverview({ location, match: { params: { registry: 'default', name: 'bob', namespaceId } } }));
      expect(gen.next().value).toMatchObject(put(setPagination({
        page: '1',
        limit: '20',
      })));
      expect(gen.next().value).toMatchObject(put(fetchVersions({ registry, name: service, namespaceId })));
      expect(gen.next().done).toBe(true);
    });
  });

});
