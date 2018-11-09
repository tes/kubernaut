import { connect } from 'react-redux';
import RegistriesPage from './RegistriesPage';
import { fetchRegistriesPagination } from '../../modules/registries';

function mapStateToProps(state, props) {
  return {
    registries: {
      data: state.registries.data,
      meta: state.registries.meta,
    },
  };
}

export default connect(mapStateToProps, { fetchRegistriesPagination })(RegistriesPage);
