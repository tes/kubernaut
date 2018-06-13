import { SubmissionError } from 'redux-form';
import { push } from 'connected-react-router';
import { makeDeployment } from '../lib/api';

// const actionsPrefix = 'KUBERNAUT/DEPLOY';


export function triggerDeployment(formValues) {
  return async (dispatch) => {
    if (!formValues.registry) return Promise.reject(new SubmissionError({ registry: 'A registry is required' }));
    if (!formValues.service) return Promise.reject(new SubmissionError({ service: 'A service name is required' }));
    if (!formValues.version) return Promise.reject(new SubmissionError({ version: 'A version is required' }));
    if (!formValues.cluster) return Promise.reject(new SubmissionError({ cluster: 'A cluster destination is required' }));
    if (!formValues.namespace) return Promise.reject(new SubmissionError({ namespace: 'A namespace is required' }));

    let data;
    try {
      data = await makeDeployment(formValues);

    } catch(err) {
      console.error(err);
      return Promise.reject(new SubmissionError({ _error: err.message || 'Something bad and unknown happened.' }));
    }

    const { id } = data;
    return dispatch(push(`/deployments/${id}`));
  };
}
