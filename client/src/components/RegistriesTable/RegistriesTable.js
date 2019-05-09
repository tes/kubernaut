import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Table } from 'reactstrap';
import TablePagination from '../TablePagination';
import { Ago } from '../DisplayDate';
import { AccountLink, RegistryLink } from '../Links';

class RegistriesTable extends Component {

  render() {
    const { error = null, loading = false, registries = {}, fetchRegistries } = this.props;

    const errorTableBody = () =>
      <tbody>
        <tr>
          <td colSpan='3'>Error loading registries</td>
        </tr>
      </tbody>
    ;

    const loadingTableBody = () =>
      <tbody>
        <tr>
          <td colSpan='3'>Loading registries…</td>
        </tr>
      </tbody>
    ;

    const emptyTableBody = () =>
      <tbody>
        <tr>
          <td colSpan='3'>There are no registries</td>
        </tr>
      </tbody>
    ;

    const RegistriesTableBody = () =>
      <tbody>
      {
        registries.items.map(registry => {
          return <tr key={registry.id} id={registry.id} >
            <td><RegistryLink registry={registry} /></td>
            <td>
              <span className="font-italic"><Ago date={registry.createdOn} /></span>
            </td>
            <td><AccountLink account={registry.createdBy} /></td>
          </tr>;
        })
      }
      </tbody>
    ;

    return (
      <div>
        <Table hover size="sm">
          <thead>
            <tr>
              <th>Name</th>
              <th>Created</th>
              <th>Created By</th>
            </tr>
          </thead>
          {
            (() => {
              if (error) return errorTableBody();
              else if (loading) return loadingTableBody();
              else if (!registries.count) return emptyTableBody();
              else return RegistriesTableBody();
            })()
          }
        </Table>
        <TablePagination
          pages={registries.pages}
          page={registries.page}
          limit={registries.limit}
          fetchContent={fetchRegistries}
        />
      </div>
    );
  }
}

RegistriesTable.propTypes = {
  error: PropTypes.object,
  loading: PropTypes.bool,
  registries: PropTypes.shape({
    limit: PropTypes.number.isRequired,
    offset: PropTypes.number.isRequired,
    pages: PropTypes.number.isRequired,
    page: PropTypes.number.isRequired,
    count: PropTypes.number.isRequired,
    items: PropTypes.array.isRequired,
  }),
  fetchRegistries: PropTypes.func,
};

export default RegistriesTable;
