import { connect } from 'react-redux';
import {
  reduxForm,
} from 'redux-form';
import JobsPage from './JobsPage';
import {
  fetchJobsPagination,
  openModal,
  closeModal,
  submitForm,
} from '../../modules/jobs';

const formName = 'newJob';

function mapStateToProps(state, props) {
  return {
    jobs: {
      data: state.jobs.data,
      meta: state.jobs.meta,
    },
    newModalOpen: state.jobs.newModalOpen,
    canCreate: state.jobs.canCreate,
    namespaces: state.jobs.namespaces,
    registries: state.jobs.registries,
    submitForm,
    initialValues: state.jobs.initialValues,
  };
}

export default connect(mapStateToProps, {
  fetchJobsPagination,
  openModal,
  closeModal,
})(reduxForm({
  form: formName,
  enableReinitialize: true,
  destroyOnUnmount: false,
})(JobsPage));
