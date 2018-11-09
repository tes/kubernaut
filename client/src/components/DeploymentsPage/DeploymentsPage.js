import React, { Component } from 'react';
import PropTypes from 'prop-types';
import DeploymentsTable from '../DeploymentsTable';

class DeploymentsPage extends Component {

  render() {
    const {
      deployments,
      fetchDeploymentsPagination,
      toggleSort,
      sort,
      ...filterActions
    } = this.props;

    return (
      <div className='row'>
        <div className='col-12'>
          <DeploymentsTable
            deployments={deployments.data}
            loading={deployments.meta.loading}
            error={deployments.meta.error}
            fetchDeployments={fetchDeploymentsPagination}
            toggleSort={toggleSort}
            sort={sort}
            filterActions={filterActions}
          />
        </div>
      </div>
    );
  }
}

DeploymentsPage.propTypes = {
  deployments: PropTypes.object,
};

export default DeploymentsPage;
