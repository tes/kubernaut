import { connect } from 'react-redux';
import {
  fetchVersionsPagination
} from '../../modules/serviceIngress';
import ServiceIngressPage from './ServiceIngressPage';
import {
  alterQuery,
  makeQueryString,
} from '../../sagas/lib/query';

export default connect((state, props) => {
  const { search } = props.location;
  const qsPagination = alterQuery(search, { pagination: makeQueryString(state.serviceIngress.pagination) });

  return {
    service: state.serviceIngress.service,
    meta: state.serviceIngress.meta,
    canManage: state.serviceIngress.canManage,
    canWriteIngress: state.serviceIngress.canWriteIngress,
    team: state.serviceIngress.team,
    versions: state.serviceIngress.versions,
    version: state.serviceIngress.version,
    versionId: props.versionId,
    qsPagination,
  };
}, {
  fetchVersionsPagination
})(ServiceIngressPage);
