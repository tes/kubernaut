import { connect } from 'react-redux';
import {
  reduxForm,
} from 'redux-form';
import AdminIngressPage from './AdminIngressPage';
import {
  fetchHostKeysPagination,
  fetchVariableKeysPagination,
  submitHostForm,
  submitVariableForm,
} from '../../modules/adminIngress';

function mapStateToProps(state, props) {
  const { account } = state;
  return {
    initialValues: state.adminIngress.initialValues,
    canAudit: account && account.permissions && account.permissions['audit-read'],
    hasClustersWrite: account && account.permissions && account.permissions['clusters-write'],
    hasIngressAdminWrite: account && account.permissions && account.permissions['ingress-admin'],
    hosts: state.adminIngress.hosts,
    variables: state.adminIngress.variables,
    submitHostForm,
    submitVariableForm,
  };
}

export default connect(mapStateToProps, {
  fetchHostKeysPagination,
  fetchVariableKeysPagination,
})(reduxForm({
  form: 'newIngressKeys',
  enableReinitialize: true,
  destroyOnUnmount: false,
})(AdminIngressPage));
