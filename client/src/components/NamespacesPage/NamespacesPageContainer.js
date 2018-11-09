import { connect } from 'react-redux';
import NamespacesPage from './NamespacesPage';
import { fetchNamespacesPagination } from '../../modules/namespaces';

function mapStateToProps(state, props) {
  return {
    namespaces: {
      data: state.namespaces.data,
      meta: state.namespaces.meta,
    },
  };
}

export default connect(mapStateToProps, { fetchNamespacesPagination })(NamespacesPage);
