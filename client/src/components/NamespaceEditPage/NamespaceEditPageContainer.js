import { connect } from 'react-redux';
import { reduxForm } from 'redux-form';

import { submitForm } from '../../modules/namespaceEdit';
import NamespaceEditPage from './NamespaceEditPage';

export default connect(({ namespaceEdit }, { namespaceId }) => ({
  namespaceId,
  canEdit: namespaceEdit.canEdit,
  canManage: namespaceEdit.canManage,
  meta: namespaceEdit.meta,
  namespace: {
    id: namespaceId,
    name: namespaceEdit.name,
    clusterName: namespaceEdit.cluster,
    cluster: {
      name: namespaceEdit.cluster,
    },
    color: namespaceEdit.color,
  },
  clusterOptions: namespaceEdit.clusters.data.items.map(({ name, id }) => ({ value: id, display: name })),
  initialValues: namespaceEdit.initialValues,
  submitForm,
}))(reduxForm({
  form: 'namespaceEdit',
  enableReinitialize: true,
  destroyOnUnmount: false,
})(NamespaceEditPage));
