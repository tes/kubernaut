import { connect } from 'react-redux';
import { fetchNamespaces } from '../../modules/namespaces';

import NamespacesPage from './NamespacesPage';

function mapStateToProps(state, props) {
  return {
    namespaces: {
      data: state.namespaces.data,
      meta: state.namespaces.meta,
    },
  };
}

const mapDispatchToProps = {
  fetchNamespaces,
};

export default connect(mapStateToProps, mapDispatchToProps)(NamespacesPage);
