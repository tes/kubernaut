import { connect } from 'react-redux';
import {
  fetchReleasesForService,
  fetchDeploymentHistoryForService,
  fetchLatestDeploymentsByNamespace
} from '../../modules/service';
import ServiceDetailsPage from './ServiceDetailsPage';

export default connect((state, { registryName, serviceName }) => ({
  routeInfo: {
    registryName,
    serviceName,
  },
  releasesList: state.service.releases,
  deploymentsList: state.service.deployments,
  latestDeployments: state.service.latestDeployments.data,
}),{
  fetchReleasesForService,
  fetchDeploymentHistoryForService,
  fetchLatestDeploymentsByNamespace,
})(ServiceDetailsPage);
