import { connect } from 'react-redux';
import { fetchReleasesForService } from '../../modules/service';
import ServiceDetailsPage from './ServiceDetailsPage';

export default connect((state, { registryName, serviceName })=>({
  routeInfo: {
    registryName,
    serviceName,
  },
  releasesList: state.service.releases,
}),{
  fetchReleasesForService,
})(ServiceDetailsPage);
