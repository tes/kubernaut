import { put, call, select } from 'redux-saga/effects';
import { SubmissionError, change, clearFields, startAsyncValidation, stopAsyncValidation } from 'redux-form';
import { push } from 'connected-react-router';

import {
  fetchRegistriesSaga,
  fetchNamespacesSaga,
  triggerDeploymentSaga,
  fetchServiceSuggestionsSaga,
  useServiceSuggestionsSaga,
  clearFormFieldsSaga,
  validateServiceSaga,
  validateVersionSaga,
} from '../deploy';

import {
  INITIALISE,
  INITIALISE_ERROR,
  SET_LOADING,
  CLEAR_LOADING,
  SET_REGISTRIES,
  SET_NAMESPACES,
  submitForm,
  fetchServiceSuggestions,
  setServiceSuggestions,
  getDeployFormValues,
  useServiceSuggestion,
  clearServiceSuggestions,
  clearFormFields,
  validateService,
  validateVersion,
} from '../../modules/deploy';

import {
  makeDeployment,
  getRegistries,
  getNamespaces,
  getServiceSuggestions,
  getReleases,
} from '../../lib/api';

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

  it('should fetch service name suggestions based on user input in form', () => {
    const formValues = { service: 'app-', registry: 'default' };
    const searchResults = [{ name: 'app-1' }, { name: 'app-2' }];
    const gen = fetchServiceSuggestionsSaga(fetchServiceSuggestions());
    expect(gen.next().value).toMatchObject(select(getDeployFormValues));
    expect(gen.next(formValues).value).toMatchObject(call(getServiceSuggestions, formValues.registry, formValues.service));
    expect(gen.next(searchResults).value).toMatchObject(put(setServiceSuggestions(['app-1', 'app-2'])));
    expect(gen.next().done).toBe(true);
  });

  it('should handle errors fetching service name suggestions', () => {
    const formValues = { service: 'app-', registry: 'default' };

    const gen = fetchServiceSuggestionsSaga(fetchServiceSuggestions({ quiet: true }));
    expect(gen.next().value).toMatchObject(select(getDeployFormValues));
    expect(gen.next(formValues).value).toMatchObject(call(getServiceSuggestions, formValues.registry, formValues.service));
    gen.throw(new Error('ouch'));
    expect(gen.next().done).toBe(true);
  });

  it('should use a selected service suggestion and then clear suggestions', () => {
    const gen = useServiceSuggestionsSaga(useServiceSuggestion('app-1'));
    expect(gen.next().value).toMatchObject(put(change('deploy', 'service', 'app-1')));
    expect(gen.next().value).toMatchObject(put(clearServiceSuggestions()));
    expect(gen.next().done).toBe(true);
  });

  it('clears field data on changes', () => {
    const gen = clearFormFieldsSaga(clearFormFields({ source: 'service' }));
    expect(gen.next().value).toMatchObject(put(clearFields('deploy', false, false, 'version', 'cluster', 'namespace')));
  });

  it('validates service field entry and error', () => {
    const formValues = { registry: 'default', service: 'abc' };
    const gen = validateServiceSaga(validateService({ quiet: true }));
    expect(gen.next().value).toMatchObject(select(getDeployFormValues));
    expect(gen.next(formValues).value).toMatchObject(put(startAsyncValidation('deploy')));
    expect(gen.next().value).toMatchObject(call(getReleases, { ...formValues }));
    expect(gen.next({ count: 0 }).value).toMatchObject(put(stopAsyncValidation('deploy', { service: `'${formValues.registry}/${formValues.service}' does not exist`})));
    expect(gen.next().done).toBe(true);
  });

  it('validates service field entry when valid', () => {
    const formValues = { registry: 'default', service: 'abc' };
    const gen = validateServiceSaga(validateService({ quiet: true }));
    expect(gen.next().value).toMatchObject(select(getDeployFormValues));
    expect(gen.next(formValues).value).toMatchObject(put(startAsyncValidation('deploy')));
    expect(gen.next().value).toMatchObject(call(getReleases, { ...formValues }));
    expect(gen.next({ count: 1 }).value).toMatchObject(put(stopAsyncValidation('deploy')));
    expect(gen.next().done).toBe(true);
  });

  it('handles and error validating service value', () => {
    const formValues = { registry: 'default', service: 'abc' };
    const gen = validateServiceSaga(validateService({ quiet: true }));
    expect(gen.next().value).toMatchObject(select(getDeployFormValues));
    expect(gen.next(formValues).value).toMatchObject(put(startAsyncValidation('deploy')));
    expect(gen.next().value).toMatchObject(call(getReleases, { ...formValues }));
    expect(gen.throw(new Error('ouch')).value).toMatchObject(put(stopAsyncValidation('deploy', { service: 'There was an error looking up services' })));
    expect(gen.next().done).toBe(true);
  });

  it('validates version field entry and error', () => {
    const newValue = '1';
    const formValues = { registry: 'default', service: 'abc' };
    const gen = validateVersionSaga(validateVersion({ newValue, quiet: true }));
    expect(gen.next().value).toMatchObject(select(getDeployFormValues));
    expect(gen.next(formValues).value).toMatchObject(put(startAsyncValidation('deploy')));
    expect(gen.next().value).toMatchObject(call(getReleases, { ...formValues, version: newValue }));
    expect(gen.next({ count: 0 }).value).toMatchObject(put(stopAsyncValidation('deploy', { version: `'${formValues.registry}/${formValues.service}@${newValue}' does not exist`})));
    expect(gen.next().done).toBe(true);
  });

  it('validates version field entry when valid', () => {
    const newValue = '1';
    const formValues = { registry: 'default', service: 'abc' };
    const gen = validateVersionSaga(validateVersion({ newValue, quiet: true }));
    expect(gen.next().value).toMatchObject(select(getDeployFormValues));
    expect(gen.next(formValues).value).toMatchObject(put(startAsyncValidation('deploy')));
    expect(gen.next().value).toMatchObject(call(getReleases, { ...formValues, version: newValue }));
    expect(gen.next({ count: 1 }).value).toMatchObject(put(stopAsyncValidation('deploy')));
    expect(gen.next().done).toBe(true);
  });

  it('handles and error validating version value', () => {
    const newValue = '1';
    const formValues = { registry: 'default', service: 'abc' };
    const gen = validateVersionSaga(validateVersion({ newValue, quiet: true }));
    expect(gen.next().value).toMatchObject(select(getDeployFormValues));
    expect(gen.next(formValues).value).toMatchObject(put(startAsyncValidation('deploy')));
    expect(gen.next().value).toMatchObject(call(getReleases, { ...formValues, version: newValue }));
    expect(gen.throw(new Error('ouch')).value).toMatchObject(put(stopAsyncValidation('deploy', { version: 'There was an error looking up versions' })));
    expect(gen.next().done).toBe(true);
  });
});
