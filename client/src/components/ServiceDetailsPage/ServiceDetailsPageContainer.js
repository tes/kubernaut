import { connect } from 'react-redux';
import {
  initServiceDetailPage,
  fetchReleasesPagination,
  fetchDeploymentsPagination,
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
  deploymentsWithNotes: state.service.deploymentsWithNotes.data,
}),{
  initServiceDetailPage,
  fetchReleasesPagination,
  fetchDeploymentsPagination,
})(ServiceDetailsPage);
