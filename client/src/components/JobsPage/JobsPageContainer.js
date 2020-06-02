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
  addFilter,
  removeFilter,
  search,
  clearSearch,
  showFilters,
  hideFilters,
  fetchJobSuggestions,
  useJobSuggestion,
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
    jobSuggestions: state.jobs.jobSuggestions,
  };
}

export default connect(mapStateToProps, {
  fetchJobsPagination,
  openModal,
  closeModal,
  addFilter,
  removeFilter,
  search,
  clearSearch,
  showFilters,
  hideFilters,
  fetchJobSuggestions,
  useJobSuggestion,
})(reduxForm({
  form: formName,
  enableReinitialize: true,
  destroyOnUnmount: false,
})(JobsPage));
