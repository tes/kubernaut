import { connect } from 'react-redux';
import { reduxForm } from 'redux-form';

import { updateServiceStatusForNamespace, fetchServicesPagination } from '../../modules/namespaceManage';
import NamespaceManagePage from './NamespaceManagePage';

export default connect(({ namespaceManage, account }, { namespaceId }) => ({
  namespaceId,
  canManage: namespaceManage.canManage,
  namespace: {
    id: namespaceManage.id,
    name: namespaceManage.name,
    clusterName: namespaceManage.cluster,
    color: namespaceManage.color,
  },
  meta: namespaceManage.meta,
  initialValues: namespaceManage.initialValues,
  services: namespaceManage.services,
}),{
  updateServiceStatusForNamespace,
  fetchServicesPagination,
})(reduxForm({
  form: 'namespaceManage',
  enableReinitialize: true,
  destroyOnUnmount: false,
})(NamespaceManagePage));
