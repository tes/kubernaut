import { connect } from 'react-redux';
import {
  reduxForm,
  // getFormValues,
  // getFormSyncErrors,
  // getFormAsyncErrors,
} from 'redux-form';
import {
  submitForm,
} from '../../modules/newIngressVersion';
import NewIngressVersionPage from './NewIngressVersionPage';

const formName = 'newIngressVersion';

export default connect((state, props) => ({
  initialValues: state.newIngressVersion.initialValues,
  ingressClasses: state.newIngressVersion.ingressClasses,
  ingressHostKeys: state.newIngressVersion.ingressHostKeys,
  service: state.newIngressVersion.service,
  meta: state.newIngressVersion.meta,
  initialEntryValues: state.newIngressVersion.initialEntryValues,
  canManage: state.newIngressVersion.canManage,
  canWriteIngress: state.newIngressVersion.canWriteIngress,
  team: state.newIngressVersion.team,
  submitForm,
}), {

})(reduxForm({
  form: formName,
  enableReinitialize: true,
  destroyOnUnmount: false,
})(NewIngressVersionPage));
