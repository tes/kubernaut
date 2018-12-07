import { call, put, select } from 'redux-saga/effects';
import { startSubmit, stopSubmit } from 'redux-form';

import {
  fetchAccountInfoSaga,
  fetchNamespacesSaga,
  fetchRegistriesSaga,
  updateRolesForNamespaceSaga,
  addNewNamespaceSaga,
  deleteRolesForNamespaceSaga,
  updateRolesForRegistrySaga,
  addNewRegistrySaga,
  deleteRolesForRegistrySaga,
  checkPermissionSaga,
} from '../editAccount';

import {
  fetchAccountInfo,
  updateRolesForNamespace,
  addNewNamespace,
  deleteRolesForNamespace,
  deleteRolesForRegistry,
  updateRolesForRegistry,
  addNewRegistry,
  selectAccount,
  FETCH_ACCOUNT_REQUEST,
  FETCH_ACCOUNT_SUCCESS,
  FETCH_ACCOUNT_ERROR,
  FETCH_NAMESPACES_REQUEST,
  FETCH_NAMESPACES_SUCCESS,
  FETCH_NAMESPACES_ERROR,
  FETCH_REGISTRIES_REQUEST,
  FETCH_REGISTRIES_SUCCESS,
  FETCH_REGISTRIES_ERROR,
  UPDATE_ROLE_FOR_NAMESPACE_SUCCESS,
  UPDATE_ROLE_FOR_REGISTRY_SUCCESS,
  setCanEdit,
} from '../../modules/editAccount';

import {
  getAccountById,
  getAccountRolesForNamesaces,
  getAccountRolesForRegistries,
  addRoleForNamespace,
  removeRoleForNamespace,
  addRoleForRegistry,
  removeRoleForRegistry,
  hasPermission,
} from '../../lib/api';

const quietOptions = { quiet: true };

describe('editAccount sagas', () => {
  describe('fetchAccountInfoSaga', () => {
    it('should fetch and succeed at getting account data', () => {
      const data = { a: 1 };
      const accountId = '123';
      const match = { params: { accountId } };
      const gen = fetchAccountInfoSaga(fetchAccountInfo({ match }));
      expect(gen.next().value).toMatchObject(put(FETCH_ACCOUNT_REQUEST()));
      expect(gen.next().value).toMatchObject(call(getAccountById, accountId));
      expect(gen.next(data).value).toMatchObject(put(FETCH_ACCOUNT_SUCCESS({ data })));
      expect(gen.next().done).toBe(true);
    });

    it('should handle errors', () => {
      const accountId = '123';
      const match = { params: { accountId } };
      const error = new Error('ouch');
      const gen = fetchAccountInfoSaga(fetchAccountInfo({ ...quietOptions, match }));
      expect(gen.next().value).toMatchObject(put(FETCH_ACCOUNT_REQUEST()));
      expect(gen.next().value).toMatchObject(call(getAccountById, accountId));
      expect(gen.throw(error).value).toMatchObject(put(FETCH_ACCOUNT_ERROR({ error: error.message })));
      expect(gen.next().done).toBe(true);
    });
  });

  describe('fetchNamespacesSaga', () => {
    it('should fetch namespaces', () => {
      const accountId = '123';
      const match = { params: { accountId } };
      const namespacesData = { limit: 50, offset: 0, count: 3, items: [1, 2, 3] };

      const gen = fetchNamespacesSaga(fetchAccountInfo({ match }));
      expect(gen.next().value).toMatchObject(put(FETCH_NAMESPACES_REQUEST()));
      expect(gen.next().value).toMatchObject(call(getAccountRolesForNamesaces, accountId));
      expect(gen.next(namespacesData).value).toMatchObject(put(FETCH_NAMESPACES_SUCCESS({ rolesData: namespacesData } )));
      expect(gen.next().done).toBe(true);
    });

    it('should tolerate errors fetching namespaces', () => {
      const accountId = '123';
      const match = { params: { accountId } };
      const error = new Error('ouch');
      const gen = fetchNamespacesSaga(fetchAccountInfo({ ...quietOptions, match }));
      expect(gen.next().value).toMatchObject(put(FETCH_NAMESPACES_REQUEST()));
      expect(gen.next().value).toMatchObject(call(getAccountRolesForNamesaces, accountId));
      expect(gen.throw(error).value).toMatchObject(put(FETCH_NAMESPACES_ERROR({ error: error.message })));
      expect(gen.next().done).toBe(true);
    });
  });

  describe('fetchRegistriesSaga', () => {
    it('should fetch registries', () => {
      const accountId = '123';
      const match = { params: { accountId } };
      const registriesData = { limit: 50, offset: 0, count: 3, items: [1, 2, 3] };

      const gen = fetchRegistriesSaga(fetchAccountInfo({ match }));
      expect(gen.next().value).toMatchObject(put(FETCH_REGISTRIES_REQUEST()));
      expect(gen.next().value).toMatchObject(call(getAccountRolesForRegistries, accountId));
      expect(gen.next(registriesData).value).toMatchObject(put(FETCH_REGISTRIES_SUCCESS({ rolesData: registriesData } )));
      expect(gen.next().done).toBe(true);
    });

    it('should tolerate errors fetching registries', () => {
      const accountId = '123';
      const match = { params: { accountId } };
      const error = new Error('ouch');
      const gen = fetchRegistriesSaga(fetchAccountInfo({ ...quietOptions, match }));
      expect(gen.next().value).toMatchObject(put(FETCH_REGISTRIES_REQUEST()));
      expect(gen.next().value).toMatchObject(call(getAccountRolesForRegistries, accountId));
      expect(gen.throw(error).value).toMatchObject(put(FETCH_REGISTRIES_ERROR({ error: error.message })));
      expect(gen.next().done).toBe(true);
    });
  });

  describe('updateRolesForNamespaceSaga', () => {
    it('should add a role to a namespace', () => {
      const namespaceId = 'abc';
      const role = 'bob';
      const accountId = '123';
      const accountData = { a: 1 };
      const gen = updateRolesForNamespaceSaga(updateRolesForNamespace({
        namespaceId,
        accountId,
        role,
        newValue: true,
        quiet: true,
      }));
      expect(gen.next().value).toMatchObject(select(selectAccount));
      expect(gen.next({ id: accountId }).value).toMatchObject(put(startSubmit('accountNamespacesRoles')));
      expect(gen.next().value).toMatchObject(call(addRoleForNamespace, accountId, namespaceId, role, { quiet: true}));
      expect(gen.next(accountData).value).toMatchObject(put(UPDATE_ROLE_FOR_NAMESPACE_SUCCESS({ data: accountData })));
      expect(gen.next().value).toMatchObject(put(stopSubmit('accountNamespacesRoles')));
      expect(gen.next().done).toBe(true);
    });

    it('should remove a role to a namespace', () => {
      const namespaceId = 'abc';
      const role = 'bob';
      const accountId = '123';
      const accountData = { a: 1 };
      const gen = updateRolesForNamespaceSaga(updateRolesForNamespace({
        namespaceId,
        accountId,
        role,
        newValue: false,
        quiet: true,
      }));
      expect(gen.next().value).toMatchObject(select(selectAccount));
      expect(gen.next({ id: accountId }).value).toMatchObject(put(startSubmit('accountNamespacesRoles')));
      expect(gen.next().value).toMatchObject(call(removeRoleForNamespace, accountId, namespaceId, role, { quiet: true}));
      expect(gen.next(accountData).value).toMatchObject(put(UPDATE_ROLE_FOR_NAMESPACE_SUCCESS({ data: accountData })));
      expect(gen.next().value).toMatchObject(put(stopSubmit('accountNamespacesRoles')));
      expect(gen.next().done).toBe(true);
    });

    it('should handle an error', () => {
      const namespaceId = 'abc';
      const role = 'bob';
      const accountId = '123';
      const gen = updateRolesForNamespaceSaga(updateRolesForNamespace({
        namespaceId,
        accountId,
        role,
        newValue: false,
        quiet: true,
      }));
      expect(gen.next().value).toMatchObject(select(selectAccount));
      expect(gen.next({ id: accountId }).value).toMatchObject(put(startSubmit('accountNamespacesRoles')));
      expect(gen.next().value).toMatchObject(call(removeRoleForNamespace, accountId, namespaceId, role, { quiet: true}));
      expect(gen.throw(new Error('ouch')).value).toMatchObject(put(stopSubmit('accountNamespacesRoles')));
      expect(gen.next().done).toBe(true);
    });
  });

  describe('updateRolesForRegistrySaga', () => {
    it('should add a role to a registry', () => {
      const registryId = 'abc';
      const role = 'bob';
      const accountId = '123';
      const accountData = { a: 1 };
      const gen = updateRolesForRegistrySaga(updateRolesForRegistry({
        registryId,
        accountId,
        role,
        newValue: true,
        quiet: true,
      }));
      expect(gen.next().value).toMatchObject(select(selectAccount));
      expect(gen.next({ id: accountId }).value).toMatchObject(put(startSubmit('accountRegistriesRoles')));
      expect(gen.next().value).toMatchObject(call(addRoleForRegistry, accountId, registryId, role, { quiet: true}));
      expect(gen.next(accountData).value).toMatchObject(put(UPDATE_ROLE_FOR_REGISTRY_SUCCESS({ data: accountData })));
      expect(gen.next().value).toMatchObject(put(stopSubmit('accountRegistriesRoles')));
      expect(gen.next().done).toBe(true);
    });

    it('should remove a role to a registry', () => {
      const registryId = 'abc';
      const role = 'bob';
      const accountId = '123';
      const accountData = { a: 1 };
      const gen = updateRolesForRegistrySaga(updateRolesForRegistry({
        registryId,
        accountId,
        role,
        newValue: false,
        quiet: true,
      }));
      expect(gen.next().value).toMatchObject(select(selectAccount));
      expect(gen.next({ id: accountId }).value).toMatchObject(put(startSubmit('accountRegistriesRoles')));
      expect(gen.next().value).toMatchObject(call(removeRoleForRegistry, accountId, registryId, role, { quiet: true}));
      expect(gen.next(accountData).value).toMatchObject(put(UPDATE_ROLE_FOR_REGISTRY_SUCCESS({ data: accountData })));
      expect(gen.next().value).toMatchObject(put(stopSubmit('accountRegistriesRoles')));
      expect(gen.next().done).toBe(true);
    });

    it('should handle an error', () => {
      const registryId = 'abc';
      const role = 'bob';
      const accountId = '123';
      const gen = updateRolesForRegistrySaga(updateRolesForRegistry({
        registryId,
        accountId,
        role,
        newValue: false,
        quiet: true,
      }));
      expect(gen.next().value).toMatchObject(select(selectAccount));
      expect(gen.next({ id: accountId }).value).toMatchObject(put(startSubmit('accountRegistriesRoles')));
      expect(gen.next().value).toMatchObject(call(removeRoleForRegistry, accountId, registryId, role, { quiet: true}));
      expect(gen.throw(new Error('ouch')).value).toMatchObject(put(stopSubmit('accountRegistriesRoles')));
      expect(gen.next().done).toBe(true);
    });
  });

  describe('addNewNamespaceSaga', () => {
    it('add a new namespace and role', () => {
      const namespaceId = 'abc';
      const role = 'bob';

      const gen = addNewNamespaceSaga(addNewNamespace());
      gen.next(); // form selector
      expect(gen.next({ newNamespace: namespaceId, roleForNewNamespace: role }).value).toMatchObject(put(updateRolesForNamespace({
        namespaceId,
        role,
        newValue: true,
      })));
      expect(gen.next().done).toBe(true);
    });

    it('add returns when missing namespace', () => {
      const gen = addNewNamespaceSaga(addNewNamespace());
      gen.next(); // form selector
      expect(gen.next({ roleForNewNamespace: 'bob' }).done).toBe(true);
    });

    it('add returns when missing role', () => {
      const gen = addNewNamespaceSaga(addNewNamespace());
      gen.next(); // form selector
      expect(gen.next({ newNamespace: 'bob' }).done).toBe(true);
    });
  });

  describe('addNewRegistrySaga', () => {
    it('add a new registry and role', () => {
      const registryId = 'abc';
      const role = 'bob';

      const gen = addNewRegistrySaga(addNewRegistry());
      gen.next(); // form selector
      expect(gen.next({ newRegistry: registryId, roleForNewRegistry: role }).value).toMatchObject(put(updateRolesForRegistry({
        registryId,
        role,
        newValue: true,
      })));
      expect(gen.next().done).toBe(true);
    });

    it('add returns when missing registry', () => {
      const gen = addNewRegistrySaga(addNewRegistry());
      gen.next(); // form selector
      expect(gen.next({ roleForNewRegistry: 'bob' }).done).toBe(true);
    });

    it('add returns when missing role', () => {
      const gen = addNewRegistrySaga(addNewRegistry());
      gen.next(); // form selector
      expect(gen.next({ newRegistry: 'bob' }).done).toBe(true);
    });
  });

  describe('deleteRolesForNamespaceSaga', () => {
    it('deletes all roles for a namespace', () => {
      const namespaceId = 'abc';
      const gen = deleteRolesForNamespaceSaga(deleteRolesForNamespace({ namespaceId }));
      gen.next(); //Form selector
      expect(gen.next({ a: true, b: true }).value).toMatchObject(call(updateRolesForNamespaceSaga, { payload: {
        namespaceId,
        role: 'a',
        newValue: false,
      } }));
      expect(gen.next().value).toMatchObject(call(updateRolesForNamespaceSaga, { payload: {
        namespaceId,
        role: 'b',
        newValue: false,
      } }));
      expect(gen.next().done).toBe(true);
    });
  });

  describe('deleteRolesForRegistrySaga', () => {
    it('deletes all roles for a registry', () => {
      const registryId = 'abc';
      const gen = deleteRolesForRegistrySaga(deleteRolesForRegistry({ registryId }));
      gen.next(); //Form selector
      expect(gen.next({ a: true, b: true }).value).toMatchObject(call(updateRolesForRegistrySaga, { payload: {
        registryId,
        role: 'a',
        newValue: false,
      } }));
      expect(gen.next().value).toMatchObject(call(updateRolesForRegistrySaga, { payload: {
        registryId,
        role: 'b',
        newValue: false,
      } }));
      expect(gen.next().done).toBe(true);
    });
  });

  it('should check permission', () => {
    const gen = checkPermissionSaga(fetchAccountInfo());
    expect(gen.next().value).toMatchObject(call(hasPermission, 'accounts-write'));
    expect(gen.next({ answer: true }).value).toMatchObject(put(setCanEdit(true)));
    expect(gen.next().done).toBe(true);
  });
});
