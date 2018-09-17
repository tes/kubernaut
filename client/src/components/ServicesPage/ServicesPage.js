import React, { Component } from 'react';
import PropTypes from 'prop-types';

import ServicesTable from '../ServicesTable';

class ServicesPage extends Component {

  componentDidMount() {
    this.props.initialise();
    this.props.fetchServicesPagination();
  }

  render() {
    const {
      services,
      fetchServicesPagination,
      toggleSort,
      sort,
      filters,
      addFilter,
      removeFilter,
      search,
      clearSearch,
      initialValues,
      showFilters,
      hideFilters,
      expandFilters,
    } = this.props;

    return (
      <div className='row'>
        <div className='col-sm'>
          <ServicesTable
            services={services.data}
            loading={services.meta.loading}
            error={services.meta.error}
            fetchServices={fetchServicesPagination}
            toggleSort={toggleSort}
            sort={sort}
            filters={filters}
            addFilter={addFilter}
            removeFilter={removeFilter}
            initialValues={initialValues}
            search={search}
            clearSearch={clearSearch}
            showFilters={showFilters}
            hideFilters={hideFilters}
            expandFilters={expandFilters}
          />
        </div>
      </div>
    );
  }
}

ServicesPage.propTypes = {
  services: PropTypes.object,
};

export default ServicesPage;
