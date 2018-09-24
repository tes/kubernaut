import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import {
  reduxForm,
} from 'redux-form';
import { get as _get } from 'lodash';
import TableFilter from './TableFilter';

const mapStateToProps = (state, props) => {
  const { filters, show, initialValues } = _get(state, props.statePath, {});

  return {
    form: `${props.formPrefix}_table_filter`,
    initialValues: initialValues || {
      searchVal: '',
    },
    filters,
    show,
  };
};

const form = connect(mapStateToProps, {

})(reduxForm({
  enableReinitialize: true,
  destroyOnUnmount: false,
})(TableFilter));

form.propTypes = {
  formPrefix: PropTypes.string.isRequired,
  initialValues: PropTypes.shape({
    searchVal: PropTypes.string.isRequired,
    column: PropTypes.string.isRequired,
    exact: PropTypes.bool.isRequired,
    not: PropTypes.bool.isRequired,
  }),
};

export default form;
