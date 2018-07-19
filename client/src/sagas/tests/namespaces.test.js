import { put, call } from 'redux-saga/effects';
import {
  fetchNamespacesDataSaga,
} from '../namespaces';

import {
  fetchNamespacesPagination,
  FETCH_NAMESPACES_REQUEST,
  FETCH_NAMESPACES_SUCCESS,
  FETCH_NAMESPACES_ERROR,
} from '../../modules/namespaces';

import {
  getNamespaces,
} from '../../lib/api';

describe('Namespaces sagas', () => {
  it('should fetch namespaces', () => {
    const namespacesData = { limit: 50, offset: 0, count: 3, items: [1, 2, 3] };

    const gen = fetchNamespacesDataSaga(fetchNamespacesPagination());
    expect(gen.next().value).toMatchObject(put(FETCH_NAMESPACES_REQUEST()));
    expect(gen.next().value).toMatchObject(call(getNamespaces, { limit: 50, offset: 0 }));
    expect(gen.next(namespacesData).value).toMatchObject(put(FETCH_NAMESPACES_SUCCESS({ data: namespacesData } )));
    expect(gen.next().done).toBe(true);
  });

  it('should tolerate errors fetching namespaces', () => {
    const error = new Error('ouch');
    const gen = fetchNamespacesDataSaga(fetchNamespacesPagination({ quiet: true }));
    expect(gen.next().value).toMatchObject(put(FETCH_NAMESPACES_REQUEST()));
    expect(gen.next().value).toMatchObject(call(getNamespaces, { limit: 50, offset: 0 }));
    expect(gen.throw(error).value).toMatchObject(put(FETCH_NAMESPACES_ERROR({ error: error.message })));
    expect(gen.next().done).toBe(true);
  });

  it('should fetch namespaces pagination', () => {
    const namespacesData = { limit: 50, offset: 50, count: 3, items: [1, 2, 3] };

    const gen = fetchNamespacesDataSaga(fetchNamespacesPagination({ page: 2 }));
    expect(gen.next().value).toMatchObject(put(FETCH_NAMESPACES_REQUEST()));
    expect(gen.next().value).toMatchObject(call(getNamespaces, { limit: 50, offset: 50 }));
    expect(gen.next(namespacesData).value).toMatchObject(put(FETCH_NAMESPACES_SUCCESS({ data: namespacesData } )));
    expect(gen.next().done).toBe(true);
  });
});
