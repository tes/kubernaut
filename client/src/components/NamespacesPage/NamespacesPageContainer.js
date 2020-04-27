import { connect } from 'react-redux';
import {
  reduxForm,
} from 'redux-form';
import NamespacesPage from './NamespacesPage';
import {
  fetchNamespacesPagination,
  openModal,
  closeModal,
  submitForm,
} from '../../modules/namespaces';

function mapStateToProps(state, props) {
  return {
    namespaces: {
      data: state.namespaces.data,
      meta: state.namespaces.meta,
    },
    clusters: state.namespaces.clusters,
    canCreate: state.namespaces.canWrite,
    initialValues: state.namespaces.initialValues,
    newModalOpen: state.namespaces.newModalOpen,
    submitForm,
  };
}

export default connect(mapStateToProps, {
  fetchNamespacesPagination,
  openModal,
  closeModal,
})(reduxForm({
  form: 'newNamespace',
  enableReinitialize: true,
  destroyOnUnmount: false,
})(NamespacesPage));
