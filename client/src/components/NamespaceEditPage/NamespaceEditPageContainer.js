import { connect } from 'react-redux';
import { reduxForm } from 'redux-form';

import { initForm, submitForm } from '../../modules/namespaceEdit';
import NamespaceEditPage from './NamespaceEditPage';
import Account from '../../lib/domain/Account';

export default connect(({ namespaceEdit, account }, { namespaceId }) => ({
  namespaceId,
  canEdit: new Account(account.data).hasPermissionOnNamespace(namespaceId, 'namespaces-write'),
  namespace: {
    name: namespaceEdit.name,
    clusterName: namespaceEdit.cluster,
    color: namespaceEdit.color,
  },
  clusterOptions: namespaceEdit.clusters.data.items.map(({ name, id }) => ({ value: id, display: name })),
  initialValues: namespaceEdit.initialValues,
  submitForm,
}),{
  initForm,
})(reduxForm({
  form: 'namespaceEdit',
  enableReinitialize: true,
  destroyOnUnmount: false,
})(NamespaceEditPage));
