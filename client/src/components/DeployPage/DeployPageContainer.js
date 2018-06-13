import { connect } from 'react-redux';
import { reduxForm } from 'redux-form';

import { triggerDeployment } from '../../modules/deploy';
import DeployPage from './DeployPage';

const mapStateToProps = (state, props) => {
  const {
    registry,
    service,
    version,
    cluster,
    namespace,
  } = props.parsedLocation;

  return {
    initialValues: {
      registry,
      service,
      version,
      cluster,
      namespace,
    },
  };
};

export default connect(mapStateToProps, { triggerDeployment })(reduxForm({
  form: 'deploy',
  enableReinitialize: true,
  destroyOnUnmount: false,
})(DeployPage));
