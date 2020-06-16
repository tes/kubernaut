import { connect } from 'react-redux';
import { reduxForm } from 'redux-form';

import { submitForm } from '../../modules/clusterEdit';
import ClusterEditPage from './ClusterEditPage';

export default connect(({ clusterEdit, account }) => ({
  canAudit: account && account.permissions && account.permissions['audit-read'],
  hasClustersWrite: account && account.permissions && account.permissions['clusters-write'],
  meta: clusterEdit.meta,
  initialValues: clusterEdit.initialValues,
  cluster: clusterEdit.cluster,
  submitForm,
}))(reduxForm({
  form: 'clusterEdit',
  enableReinitialize: true,
  destroyOnUnmount: false,
})(ClusterEditPage));
