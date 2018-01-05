import { connect, } from 'react-redux';
import { fetchNamespaces, } from '../../actions/namespace';

import NamespacesPage from './NamespacesPage';

function mapStateToProps(state, props) {
  return {
    namespaces: {
      data: state.namespaces.data,
      meta: state.namespaces.meta,
    },
  };
}

function mapDispatchToProps(dispatch) {
  return {
    fetchNamespaces: (options) => {
      dispatch(fetchNamespaces(options));
    },
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(NamespacesPage);
