import { connect, } from 'react-redux';
import { fetchRegistries, } from '../../actions/registry';

import RegistriesPage from './RegistriesPage';

function mapStateToProps(state, props) {
  return {
    registries: {
      data: state.registries.data,
      meta: state.registries.meta,
    },
  };
}

function mapDispatchToProps(dispatch) {
  return {
    fetchRegistries: (options) => {
      dispatch(fetchRegistries(options));
    },
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(RegistriesPage);
