import { call, put, select } from 'redux-saga/effects';
import { push } from 'connected-react-router';
import {
  resetSection,
  arrayPush,
  SubmissionError,
  arrayRemove,
  startAsyncValidation,
  stopAsyncValidation,
} from 'redux-form';
import {
  fetchNamespaceInfoSaga,
  fetchLastVersionSaga,
  checkPermissionSaga,
  addSecretSaga,
  removeSecretSaga,
  saveVersionSaga,
  validateAnnotationsSaga,
} from '../newSecretVersion';

import {
  initNewSecretVersion,
  FETCH_VERSIONS_REQUEST,
  FETCH_VERSIONS_SUCCESS,
  FETCH_VERSIONS_ERROR,
  FETCH_NAMESPACE_REQUEST,
  FETCH_NAMESPACE_SUCCESS,
  FETCH_NAMESPACE_ERROR,
  addSecret,
  removeSecret,
  saveVersion,
  canManageRequest,
  setCanManage,
  selectNamespace,
  validateAnnotations,
  getFormValues,
  getFormAsyncErrors,
} from '../../modules/newSecretVersion';

import {
  getNamespace,
  hasPermissionOn,
  getSecretVersions,
  getSecretVersionWithData,
  saveSecretVersion,
} from '../../lib/api';

describe('newSecretVersion sagas', () => {
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

        const gen = fetchNamespaceInfoSaga(initNewSecretVersion(initPayload));
        expect(gen.next().value).toMatchObject(put(FETCH_NAMESPACE_REQUEST()));
        expect(gen.next().value).toMatchObject(call(getNamespace, namespaceId));
        expect(gen.next(namespaceData).value).toMatchObject(put(FETCH_NAMESPACE_SUCCESS({ data: namespaceData } )));
        expect(gen.next().done).toBe(true);
      });

      it('should tolerate errors fetching service info', () => {
        const error = new Error('ouch');
        const gen = fetchNamespaceInfoSaga(initNewSecretVersion(initPayload));
        expect(gen.next().value).toMatchObject(put(FETCH_NAMESPACE_REQUEST()));
        expect(gen.next().value).toMatchObject(call(getNamespace, namespaceId));
        expect(gen.throw(error).value).toMatchObject(put(FETCH_NAMESPACE_ERROR({ error: error.message })));
        expect(gen.next().done).toBe(true);
      });
    });

    describe('check permission', () => {
      const initPayload = { match, quiet: true };

      it('fetches and sets permission information', () => {
        const gen = checkPermissionSaga(initNewSecretVersion(initPayload));
        expect(gen.next().value).toMatchObject(put(canManageRequest()));
        expect(gen.next().value).toMatchObject(call(hasPermissionOn,'secrets-manage', 'namespace', namespaceId));
        expect(gen.next({ answer: true }).value).toMatchObject(put(setCanManage(true)));
        expect(gen.next().done).toBe(true);
      });
    });

    describe('fetch latest version', () => {
      const initPayload = { match, quiet: true };
      it('should fetch versions', () => {
        const versionsData = { count: 3, items: [{ id: 1 }, { id: 2 }] };
        const versionData = { id: 1, name: 'abc' };

        const gen = fetchLastVersionSaga(initNewSecretVersion(initPayload));
        expect(gen.next(paginationState).value).toMatchObject(put(FETCH_VERSIONS_REQUEST()));
        expect(gen.next().value).toMatchObject(call(getSecretVersions, registry, service, namespaceId, 0, 1));
        expect(gen.next(versionsData).value).toMatchObject(call(getSecretVersionWithData, 1));
        expect(gen.next(versionData).value).toMatchObject(put(FETCH_VERSIONS_SUCCESS({ latestVersion: versionData } )));
        expect(gen.next().done).toBe(true);
      });

      it('should tolerate errors fetching versions', () => {
        const error = new Error('ouch');
        const gen = fetchLastVersionSaga(initNewSecretVersion(initPayload));
        expect(gen.next(paginationState).value).toMatchObject(put(FETCH_VERSIONS_REQUEST()));
        expect(gen.next().value).toMatchObject(call(getSecretVersions, registry, service, namespaceId, 0, 1));
        expect(gen.throw(error).value).toMatchObject(put(FETCH_VERSIONS_ERROR({ error: error.message })));
        expect(gen.next().done).toBe(true);
      });
    });

    describe('remove secret', () => {
      it('remvoes a secret from the form', () => {
        const arrayIndex = 3;
        const gen = removeSecretSaga(removeSecret(arrayIndex));
        expect(gen.next().value).toMatchObject(put(arrayRemove('newSecretVersion', 'secrets', arrayIndex)));
        expect(gen.next().done).toBe(true);
      });
    });

    describe('add new secret to version', () => {
      it('adds a new secret to the secrets array', () => {
        const values = {
          newSecretSection: {
            newSecretName: 'abc',
            newSecretType: 'json',
          }
        };
        const gen = addSecretSaga(addSecret());
        expect(gen.next().value).toMatchObject(select(getFormValues));
        expect(gen.next(values).value).toMatchObject(put(arrayPush('newSecretVersion', 'secrets', { key: 'abc', value: '', editor: 'json' })));
        expect(gen.next().value).toMatchObject(put(resetSection('newSecretVersion', 'newSecretSection')));
        expect(gen.next().done).toBe(true);
      });
    });

    describe('save version', () => {
      const values = {
        registry: 'default',
        service: 'abc',
        secrets: [{ key: 'abc', editor: 'json', value: 'bob' }]
      };

      it('saves a version of a secret', () => {
        const gen = saveVersionSaga(saveVersion.request({}));
        expect(gen.next().value).toMatchObject(select(getFormValues));
        expect(gen.next(values).value).toMatchObject(select(selectNamespace));
        expect(gen.next({ id: 123 }).value).toMatchObject(call(saveSecretVersion, values.registry, values.service, 123, values));
        expect(gen.next('xyz').value).toMatchObject(put(saveVersion.success()));
        expect(gen.next().value).toMatchObject(put(push('/services/secrets/view/xyz')));
        expect(gen.next().done).toBe(true);
      });

      it('handles errors saving version of a secret', () => {
        const gen = saveVersionSaga(saveVersion.request({}));
        expect(gen.next().value).toMatchObject(select(getFormValues));
        expect(gen.next(values).value).toMatchObject(select(selectNamespace));
        expect(gen.next({ id: 123 }).value).toMatchObject(call(saveSecretVersion, values.registry, values.service, 123, values));
        expect(gen.throw(new Error('ouch')).value).toMatchObject(put(saveVersion.failure(new SubmissionError({ _error: 'ouch' }))));
        expect(gen.next().done).toBe(true);
      });
    });

    describe('checking editor annotations for validation', () => {
      it('parses and sets validation', () => {
        const payload = { annotations: [{ type: 'error' }], index: 0 };
        const gen = validateAnnotationsSaga(validateAnnotations(payload));
        expect(gen.next().value).toMatchObject(put(startAsyncValidation('newSecretVersion')));
        expect(gen.next().value).toMatchObject(select(getFormAsyncErrors));
        expect(gen.next().value).toMatchObject(put(stopAsyncValidation('newSecretVersion', {
          secrets: [{ value: 'Invalid' }]
        })));
        expect(gen.next().done).toBe(true);
      });

      it('still sets existing errors if none in current batch', () => {
        const payload = { annotations: [], index: 0 };
        const existing = {
          secrets: [, { value: 'Invalid' }]
        };
        const gen = validateAnnotationsSaga(validateAnnotations(payload));
        expect(gen.next().value).toMatchObject(put(startAsyncValidation('newSecretVersion')));
        expect(gen.next().value).toMatchObject(select(getFormAsyncErrors));
        expect(gen.next(existing).value).toMatchObject(put(stopAsyncValidation('newSecretVersion', existing)));
        expect(gen.next().done).toBe(true);
      });

      it('merges existing errors with new errors', () => {
        const payload = { annotations: [{ type: 'error' }], index: 0 };
        const existing = {
          secrets: [, { value: 'Invalid' }]
        };
        const gen = validateAnnotationsSaga(validateAnnotations(payload));
        expect(gen.next().value).toMatchObject(put(startAsyncValidation('newSecretVersion')));
        expect(gen.next().value).toMatchObject(select(getFormAsyncErrors));
        expect(gen.next(existing).value).toMatchObject(put(stopAsyncValidation('newSecretVersion', {
          secrets: [{ value: 'Invalid' }, { value: 'Invalid' }]
        })));
        expect(gen.next().done).toBe(true);
      });
    });
  });


});
