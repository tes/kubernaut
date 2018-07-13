import { connect } from 'react-redux';
import { fetchRegistriesPagination } from '../../modules/registries';

import RegistriesPage from './RegistriesPage';

function mapStateToProps(state, props) {
  return {
    registries: {
      data: state.registries.data,
      meta: state.registries.meta,
    },
  };
}

const mapDispatchToProps = {
  fetchRegistriesPagination,
};

export default connect(mapStateToProps, mapDispatchToProps)(RegistriesPage);
