import { connect } from 'react-redux';
import { reduxForm } from 'redux-form';

import { triggerDeployment } from '../../modules/deploy';
import DeployPage from './DeployPage';

export default connect(() => ({}), { triggerDeployment })(reduxForm({
  form: 'deploy',
  enableReinitialize: true,
  destroyOnUnmount: false,
})(DeployPage));
