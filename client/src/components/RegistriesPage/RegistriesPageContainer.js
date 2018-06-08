import { connect } from 'react-redux';
import { fetchRegistries } from '../../modules/registries';

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
  fetchRegistries,
};

export default connect(mapStateToProps, mapDispatchToProps)(RegistriesPage);
