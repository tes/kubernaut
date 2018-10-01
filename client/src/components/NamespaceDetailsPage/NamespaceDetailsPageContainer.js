import { connect } from 'react-redux';
import {
  fetchNamespacePageData,
  fetchDeploymentsPagination,
  toggleSort,
} from '../../modules/namespace';
import NamespaceDetailsPage from './NamespaceDetailsPage';
import Account from '../../lib/domain/Account';

export default connect((state, { namespaceId }) => ({
  namespaceId,
  canEdit: new Account(state.account.data).hasPermissionOnNamespace(namespaceId, 'namespaces-write'),
  canManage: new Account(state.account.data).hasPermissionOnNamespace(namespaceId, 'namespaces-manage'),
  namespace: state.namespace.namespace,
  deployments: state.namespace.deployments,
}),{
  fetchNamespacePageData,
  fetchDeploymentsPagination,
  toggleSort,
})(NamespaceDetailsPage);
