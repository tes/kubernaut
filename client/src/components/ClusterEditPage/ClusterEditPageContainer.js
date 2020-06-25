import { connect } from 'react-redux';
import { reduxForm } from 'redux-form';

import {
  submitForm,
  submitNewHostForm,
  submitNewVariableForm,
  submitNewClassForm,
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

  const availableIngressClasses = clusterEdit.ingressClasses.items.filter((ic) =>
    !clusterEdit.initialValues.clusterIngressClasses.classes.find((hc => hc.ingressClass.id === ic.id))
  );

  return {
    canAudit: account && account.permissions && account.permissions['audit-read'],
    hasClustersWrite: account && account.permissions && account.permissions['clusters-write'],
    hasIngressAdminWrite: account && account.permissions && account.permissions['ingress-admin'],
    meta: clusterEdit.meta,
    initialValues: clusterEdit.initialValues,
    cluster: clusterEdit.cluster,
    availableIngressHostKeys,
    availableIngressVariableKeys,
    availableIngressClasses,
    submitForm,
    submitNewHostForm,
    submitNewVariableForm,
    submitNewClassForm,
    updateHostsForm,
    updateVariablesForm,
  };
})(reduxForm({
  form: 'clusterEdit',
  enableReinitialize: true,
  destroyOnUnmount: false,
})(ClusterEditPage));
