import { put, call } from 'redux-saga/effects';
import { SubmissionError } from 'redux-form';
import { push } from 'connected-react-router';

import {
  fetchRegistriesSaga,
  fetchNamespacesSaga,
  triggerDeploymentSaga,
} from './deploy';

import {
  INITIALISE,
  INITIALISE_ERROR,
  SET_LOADING,
  CLEAR_LOADING,
  SET_REGISTRIES,
  SET_NAMESPACES,
  submitForm,
} from '../modules/deploy';

import {
  makeDeployment,
  getRegistries,
  getNamespaces,
} from '../lib/api';

const formValues = {
  registry: 'abc',
  service: 'abc',
  version: 'abc',
  cluster: 'abc',
  namespace: 'abc',
};

describe('Deploy sagas', () => {
  it('should fetch registries for form', () => {
    const data = { items: [{ name: 'abc' }], count:  1 };
    const gen = fetchRegistriesSaga(INITIALISE({ quiet: true }));
    expect(gen.next().value).toMatchObject(put(SET_LOADING()));
    expect(gen.next().value).toMatchObject(call(getRegistries));
    expect(gen.next(data).value).toMatchObject(put(SET_REGISTRIES({ data: ['abc'] })));
    expect(gen.next().value).toMatchObject(put(CLEAR_LOADING()));
    expect(gen.next().done).toBe(true);
  });

  it('should handle errors in fetching registries', () => {
    const error = new Error('ouch');
    const gen = fetchRegistriesSaga(INITIALISE({ quiet: true }));
    expect(gen.next().value).toMatchObject(put(SET_LOADING()));
    expect(gen.next().value).toMatchObject(call(getRegistries));
    expect(gen.throw(error).value).toMatchObject(put(INITIALISE_ERROR({ error })));
    expect(gen.next().value).toMatchObject(put(CLEAR_LOADING()));
    expect(gen.next().done).toBe(true);
  });

  it('should fetch namespaces for form', () => {
    const data = { items: [{ name: 'abc', cluster: 'bob' }], count:  1 };
    const gen = fetchNamespacesSaga(INITIALISE({ quiet: true }));
    expect(gen.next().value).toMatchObject(call(getNamespaces));
    expect(gen.next(data).value).toMatchObject(put(SET_NAMESPACES({ data: data.items })));
    expect(gen.next().done).toBe(true);
  });

  it('should handle errors in fetching namespaces', () => {
    const error = new Error('ouch');
    const gen = fetchNamespacesSaga(INITIALISE({ quiet: true }));
    expect(gen.next().value).toMatchObject(call(getNamespaces));
    expect(gen.throw(error).value).toMatchObject(put(INITIALISE_ERROR({ error })));
    expect(gen.next().done).toBe(true);
  });

  it('should submit form values and trigger a deployment', () => {
    const options = { quiet: true };
    const gen = triggerDeploymentSaga(submitForm.request(formValues), options);
    expect(gen.next().value).toMatchObject(call(makeDeployment, formValues, options));
    expect(gen.next({ id: 'abc' }).value).toMatchObject(put(submitForm.success()));
    expect(gen.next().value).toMatchObject(put(push('/deployments/abc')));
    expect(gen.next().done).toBe(true);
  });

  it('should handle failures submitting form values', () => {
    const options = { quiet: true };
    const error = new Error('ouch');
    const formError = new SubmissionError({ _error: error.message });
    const gen = triggerDeploymentSaga(submitForm.request(formValues), options);
    expect(gen.next().value).toMatchObject(call(makeDeployment, formValues, options));
    expect(gen.throw(error).value).toMatchObject(put(submitForm.failure(formError)));
    expect(gen.next().done).toBe(true);
  });
});
