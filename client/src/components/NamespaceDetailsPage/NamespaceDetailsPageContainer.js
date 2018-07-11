import { connect } from 'react-redux';
import { fetchNamespace } from '../../modules/namespace';
import NamespaceDetailsPage from './NamespaceDetailsPage';

export default connect((state, { namespaceId }) => ({
  namespaceId,
  namespace: state.namespace,
}),{
  fetchNamespace,
})(NamespaceDetailsPage);
