import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Table } from 'reactstrap';
import TablePagination from '../TablePagination';
import { Human } from '../DisplayDate';
import { AccountLink, RegistryLink, ServiceLink } from '../Links';

class ServicesTable extends Component {

  render() {
    const { error = null, loading = false, services = {}, fetchServices } = this.props;

    const errorTableBody = () =>
      <tbody >
        <tr>
          <td colSpan='5'>Error loading services</td>
        </tr>
      </tbody>
    ;

    const loadingTableBody = () =>
      <tbody>
        <tr>
          <td colSpan='5'>Loading services…</td>
        </tr>
      </tbody>
    ;

    const emptyTableBody = () =>
      <tbody>
        <tr>
          <td colSpan='5'>There are no services</td>
        </tr>
      </tbody>
    ;

    const servicesTableBody = () =>
      <tbody>
      {
        services.items.map(service => (
          <tr key={service.id}>
            <td><ServiceLink service={service} /></td>
            <td><RegistryLink registry={service.registry} /></td>
            <td><span><Human date={service.createdOn} /></span></td>
            <td><AccountLink account={service.createdBy} /></td>
          </tr>
        ))
      }
      </tbody>
    ;


    return (
      <div>
        <Table>
          <thead>
            <tr>
              <th>Service</th>
              <th>Registry</th>
              <th>Created</th>
              <th>Created By</th>
            </tr>
          </thead>
          {
            (() => {
              if (error) return errorTableBody();
              else if (loading) return loadingTableBody();
              else if (!services.count) return emptyTableBody();
              else return servicesTableBody();
            })()
          }
        </Table>
        <TablePagination
          pages={services.pages}
          page={services.page}
          limit={services.limit}
          fetchContent={fetchServices}
        />
      </div>
    );
  }
}

ServicesTable.propTypes = {
  error: PropTypes.object,
  loading: PropTypes.bool,
  services: PropTypes.shape({
    limit: PropTypes.number.isRequired,
    offset: PropTypes.number.isRequired,
    pages: PropTypes.number.isRequired,
    page: PropTypes.number.isRequired,
    count: PropTypes.number.isRequired,
    items: PropTypes.array.isRequired,
  }),
  fetchServices: PropTypes.func,
};

export default ServicesTable;
