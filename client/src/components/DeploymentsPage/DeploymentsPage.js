import React, { Component } from 'react';
import PropTypes from 'prop-types';

import DeploymentsTable from '../DeploymentsTable';

class DeploymentsPage extends Component {

  componentDidMount() {
    this.props.fetchDeployments(this.props.deployments.data);
  }

  render() {
    const { deployments, fetchDeployments } = this.props;

    return (
      <div className='row'>
        <div className='col-12'>
          <DeploymentsTable deployments={deployments.data} loading={deployments.meta.loading} error={deployments.meta.error} fetchDeployments={fetchDeployments} />
        </div>
      </div>
    );
  }
}

DeploymentsPage.propTypes = {
  deployments: PropTypes.object,
};

export default DeploymentsPage;
