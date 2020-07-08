import { connect } from 'react-redux';
import {
  fetchVersionsPagination
} from '../../modules/serviceIngress';
import ServiceIngressPage from './ServiceIngressPage';


export default connect((state, props) => {

  return {
    service: state.serviceIngress.service,
    meta: state.serviceIngress.meta,
    canManage: state.serviceIngress.canManage,
    canWriteIngress: state.serviceIngress.canWriteIngress,
    team: state.serviceIngress.team,
    versions: state.serviceIngress.versions,
    version: state.serviceIngress.version,
    versionId: props.versionId,
  };
}, {
  fetchVersionsPagination
})(ServiceIngressPage);
