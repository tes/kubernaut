import { connect } from 'react-redux';
import { reduxForm } from 'redux-form';

import { updateServiceStatusForNamespace, fetchServicesPagination } from '../../modules/namespaceManage';
import NamespaceManagePage from './NamespaceManagePage';
import Account from '../../lib/domain/Account';

export default connect(({ namespaceManage, account }, { namespaceId }) => ({
  namespaceId,
  canManage: new Account(account.data).hasPermissionOnNamespace(namespaceId, 'namespaces-manage'),
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
