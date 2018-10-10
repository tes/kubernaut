import React, { Component } from 'react';
import PropTypes from 'prop-types';

import ReleasesTable from '../ReleasesTable';

class ReleasesPage extends Component {

  render() {
    const {
      releases,
      fetchReleasesPagination,
      toggleSort,
      sort,
      ...filterActions
    } = this.props;

    return (
      <div className='row'>
        <div className='col-sm'>
          <ReleasesTable
            releases={releases.data}
            loading={releases.meta.loading}
            error={releases.meta.error}
            fetchReleases={fetchReleasesPagination}
            toggleSort={toggleSort}
            sort={sort}
            filterActions={filterActions}
          />
        </div>
      </div>
    );
  }
}

ReleasesPage.propTypes = {
  releases: PropTypes.object,
};

export default ReleasesPage;
