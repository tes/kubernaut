import React, { Component, } from 'react';
import PropTypes from 'prop-types';

import ReleasesTable from '../ReleasesTable';

class ReleasesPage extends Component {

  componentDidMount() {
    this.props.fetchReleases();
  }

  render() {
    const { error, loading, releases, fetchReleases, } = this.props;

    return (
      <div className='row'>
        <div className='col-12'>
          <ReleasesTable releases={releases.data} loading={loading} error={error} fetchReleases={fetchReleases} />
        </div>
      </div>
    );
  }
}

ReleasesPage.propTypes = {
  releases: PropTypes.object,
};

export default ReleasesPage;
