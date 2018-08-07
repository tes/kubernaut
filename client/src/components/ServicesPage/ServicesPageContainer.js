import { connect } from 'react-redux';
import { fetchServicesPagination } from '../../modules/services';

import ServicesPage from './ServicesPage';

function mapStateToProps(state, props) {
  return {
    services: {
      data: state.services.data,
      meta: state.services.meta,
    },
  };
}

const mapDispatchToProps = {
  fetchServicesPagination,
};

export default connect(mapStateToProps, mapDispatchToProps)(ServicesPage);
