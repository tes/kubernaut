import { connect } from 'react-redux';
import { fetchNamespacePageData, fetchDeploymentsPagination } from '../../modules/namespace';
import NamespaceDetailsPage from './NamespaceDetailsPage';

export default connect((state, { namespaceId }) => ({
  namespaceId,
  namespace: state.namespace.namespace,
  deployments: state.namespace.deployments,
}),{
  fetchNamespacePageData,
  fetchDeploymentsPagination,
})(NamespaceDetailsPage);
