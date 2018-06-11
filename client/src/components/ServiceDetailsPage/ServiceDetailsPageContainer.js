import { connect } from 'react-redux';
import {
  fetchReleasesForService,
  fetchDeploymentHistoryForService,
} from '../../modules/service';
import ServiceDetailsPage from './ServiceDetailsPage';

export default connect((state, { registryName, serviceName }) => ({
  routeInfo: {
    registryName,
    serviceName,
  },
  releasesList: state.service.releases,
  deploymentsList: state.service.deployments,
}),{
  fetchReleasesForService,
  fetchDeploymentHistoryForService,
})(ServiceDetailsPage);
