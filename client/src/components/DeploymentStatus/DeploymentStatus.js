import React from 'react';
import PropTypes from 'prop-types';


const DeploymentStatus = ({ deployment: dep }) => (
  <i className={`fa fa-${dep.status === 'failed' ? 'times' : dep.status === 'successful' ? 'check' : 'spinner fa-pulse'} text-${dep.status === 'failed' ? 'danger' : dep.status === 'successful' ? 'success' : 'secondary'}`}></i>
);

DeploymentStatus.propTypes = {
  deployment: PropTypes.object.isRequired,
};

export default DeploymentStatus;
