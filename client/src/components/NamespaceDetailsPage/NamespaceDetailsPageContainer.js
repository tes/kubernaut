import { connect } from 'react-redux';
import {
  fetchDeploymentsPagination,
  toggleSort,
} from '../../modules/namespace';
import NamespaceDetailsPage from './NamespaceDetailsPage';

export default connect((state, { namespaceId }) => ({
  namespaceId,
  canEdit: state.namespace.canEdit,
  canManage: state.namespace.canManage,
  namespace: state.namespace.namespace,
  deployments: state.namespace.deployments,
}),{
  fetchDeploymentsPagination,
  toggleSort,
})(NamespaceDetailsPage);
