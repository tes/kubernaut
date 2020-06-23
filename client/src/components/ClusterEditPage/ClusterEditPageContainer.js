import { connect } from 'react-redux';
import { reduxForm } from 'redux-form';

import {
  submitForm,
  submitNewHostForm,
  submitNewVariableForm,
  updateHostsForm,
  updateVariablesForm,
} from '../../modules/clusterEdit';
import ClusterEditPage from './ClusterEditPage';

export default connect(({ clusterEdit, account }) => {
  const availableIngressHostKeys = clusterEdit.ingressHosts.items.filter((ih) =>
    !clusterEdit.initialValues.clusterIngressHosts.hosts.find((hv => hv.ingressHostKey.id === ih.id))
  );

  const availableIngressVariableKeys = clusterEdit.ingressVariables.items.filter((iv) =>
    !clusterEdit.initialValues.clusterIngressVariables.variables.find((hv => hv.ingressVariableKey.id === iv.id))
  );

  return {
    canAudit: account && account.permissions && account.permissions['audit-read'],
    hasClustersWrite: account && account.permissions && account.permissions['clusters-write'],
    meta: clusterEdit.meta,
    initialValues: clusterEdit.initialValues,
    cluster: clusterEdit.cluster,
    availableIngressHostKeys,
    availableIngressVariableKeys,
    submitForm,
    submitNewHostForm,
    submitNewVariableForm,
    updateHostsForm,
    updateVariablesForm,
  };
})(reduxForm({
  form: 'clusterEdit',
  enableReinitialize: true,
  destroyOnUnmount: false,
})(ClusterEditPage));
