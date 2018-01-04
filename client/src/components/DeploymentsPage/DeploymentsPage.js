import React, { Component, } from 'react';
import PropTypes from 'prop-types';

import DeploymentsTable from '../DeploymentsTable';

class DeploymentsPage extends Component {

  componentDidMount() {
    this.props.fetchDeployments();
  }

  render() {
    const { error, loading, deployments, fetchDeployments, } = this.props;

    return (
      <div className='row'>
        <div className='col-12'>
          <DeploymentsTable deployments={deployments.data} loading={loading} error={error} fetchDeployments={fetchDeployments} />
        </div>
      </div>
    );
  }
}

DeploymentsPage.propTypes = {
  deployments: PropTypes.object,
};

export default DeploymentsPage;
