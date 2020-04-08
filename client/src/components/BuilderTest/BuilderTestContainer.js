import { connect } from 'react-redux';
import {
  reduxForm,
  getFormValues,
} from 'redux-form';

import {
  toggleCollapsed,
} from '../../modules/builderTest';
import BuilderTest from './BuilderTest';

const formName = 'BuilderTest';

const mapStateToProps = (state, props) => {
  const { builderTest } = state;
  const currentFormValues = getFormValues(formName)(state) || {};

  return {
    initialValues: builderTest.initialValues,
    currentFormValues,
    collapsed: builderTest.collapsed,
  };
};

export default connect(mapStateToProps, {
  toggleCollapsed
})(reduxForm({
  form: formName,
  enableReinitialize: true,
  destroyOnUnmount: false,
})(BuilderTest));
