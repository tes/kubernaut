import { connect } from 'react-redux';
import {
  reduxForm,
  getFormValues,
} from 'redux-form';

import {
  toggleCollapsed,
} from '../../modules/newJobVersion';
import NewJobVersionPage from './NewJobVersionPage';

const formName = 'newJobVersion';

const mapStateToProps = (state, props) => {
  const { newJobVersion } = state;
  const currentFormValues = getFormValues(formName)(state) || {};

  return {
    initialValues: newJobVersion.initialValues,
    currentFormValues,
    collapsed: newJobVersion.collapsed,
    meta: newJobVersion.meta,
  };
};

export default connect(mapStateToProps, {
  toggleCollapsed
})(reduxForm({
  form: formName,
  enableReinitialize: true,
  destroyOnUnmount: false,
})(NewJobVersionPage));
