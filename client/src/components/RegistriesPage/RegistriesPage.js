import React, { Component } from 'react';
import PropTypes from 'prop-types';

import RegistriesTable from '../RegistriesTable';

class RegistriesPage extends Component {

  render() {
    const { registries, fetchRegistriesPagination } = this.props;

    return (
      <div className='row page-frame'>
        <div className='col-sm'>
          <RegistriesTable registries={registries.data} loading={registries.meta.loading} error={registries.meta.error} fetchRegistries={fetchRegistriesPagination} />
        </div>
      </div>
    );
  }
}

RegistriesPage.propTypes = {
  registries: PropTypes.object,
};

export default RegistriesPage;
