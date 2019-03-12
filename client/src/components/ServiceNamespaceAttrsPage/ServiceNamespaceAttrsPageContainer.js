import { connect } from 'react-redux';
import { reduxForm } from 'redux-form';

import { submitForm } from '../../modules/serviceNamespaceAttrs';
import ServiceNamespaceAttrsPage from './ServiceNamespaceAttrsPage';

export default connect(({ serviceNamespaceAttrs }) => ({
  canManage: serviceNamespaceAttrs.canManage,
  meta: serviceNamespaceAttrs.meta,
  namespace: serviceNamespaceAttrs.namespace,
  initialValues: serviceNamespaceAttrs.initialValues,
  submitForm,
}))(reduxForm({
  form: 'serviceNamespaceAttrs',
  enableReinitialize: true,
  destroyOnUnmount: false,
})(ServiceNamespaceAttrsPage));
