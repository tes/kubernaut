import { connect } from 'react-redux';
import SecretVersionViewPage from './SecretVersionViewPage';

export default connect(({ secretVersion, account }) => ({
  meta: secretVersion.meta,
  version: secretVersion.version,
  namespace: secretVersion.version.namespace,
}))(SecretVersionViewPage);
