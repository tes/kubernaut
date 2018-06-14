import React, { Component } from 'react';
import PropTypes from 'prop-types';

import RegistriesTable from '../RegistriesTable';

class RegistriesPage extends Component {

  componentDidMount() {
    this.props.fetchRegistries();
  }

  render() {
    const { registries, fetchRegistries } = this.props;

    return (
      <div className='row'>
        <div className='col-sm'>
          <RegistriesTable registries={registries.data} loading={registries.meta.loading} error={registries.meta.error} fetchRegistries={fetchRegistries} />
        </div>
      </div>
    );
  }
}

RegistriesPage.propTypes = {
  registries: PropTypes.object,
};

export default RegistriesPage;
