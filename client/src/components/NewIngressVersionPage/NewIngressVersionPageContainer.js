import { connect } from 'react-redux';
import {
  reduxForm,
  getFormValues,
} from 'redux-form';
import {
  submitForm,
  validateCustomHost,
} from '../../modules/newIngressVersion';
import NewIngressVersionPage from './NewIngressVersionPage';

const formName = 'newIngressVersion';

const validate = (values, props) => {
  const errors = {};
  errors.entries = (values.entries || []).map(entry => {
    const toReturn = {
      annotations: (entry.annotations || []).map(a => ({
        name: a.name ? null : 'Must select an annotation name.',
        value: a.value ? null : 'Must provide an annotation value.',
      })),
      rules: (entry.rules || []).map(rule => ({
        path: rule.path ? null : 'Must provide a path.',
        port: rule.port ? null : 'Must provide a port.',
      })),
    };

    if (!entry.ingressClass) {
      toReturn.ingressClass = 'Must select an ingress class.';
    }

    return toReturn;
  });

  return errors;
};


export default connect((state, props) => {
  const currentFormValues = getFormValues(formName)(state) || {};

  return {
    initialValues: state.newIngressVersion.initialValues,
    ingressClasses: state.newIngressVersion.ingressClasses,
    ingressHostKeys: state.newIngressVersion.ingressHostKeys,
    ingressVariables: state.newIngressVersion.ingressVariables,
    service: state.newIngressVersion.service,
    meta: state.newIngressVersion.meta,
    initialEntryValues: state.newIngressVersion.initialEntryValues,
    canManage: state.newIngressVersion.canManage,
    canWriteIngress: state.newIngressVersion.canWriteIngress,
    team: state.newIngressVersion.team,
    submitForm,
    currentFormValues,
  };
}, {
  validateCustomHost,
})(reduxForm({
  form: formName,
  enableReinitialize: true,
  destroyOnUnmount: false,
  validate,
})(NewIngressVersionPage));
