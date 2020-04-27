import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Table } from 'reactstrap';
import TablePagination from '../TablePagination';
import { AccountLink, NamespaceLink, ClusterLink } from '../Links';

class NamespacesTable extends Component {

  render() {
    const { error = null, loading = false, namespaces = {}, fetchNamespaces } = this.props;

    const errorTableBody = () =>
      <tbody>
        <tr>
          <td colSpan='4'>Error loading namespaces</td>
        </tr>
      </tbody>
    ;

    const loadingTableBody = () =>
      <tbody>
        <tr>
          <td colSpan='4'>Loading namespaces…</td>
        </tr>
      </tbody>
    ;

    const emptyTableBody = () =>
      <tbody>
        <tr>
          <td colSpan='4'>There are no namespaces</td>
        </tr>
      </tbody>
    ;

    const NamespacesTableBody = () =>
      <tbody>
      {
        namespaces.items.map(namespace => {
          return <tr key={namespace.id} id={namespace.id} >
            <td><NamespaceLink namespace={namespace} /></td>
            <td><ClusterLink cluster={namespace.cluster} /></td>
            <td><AccountLink account={namespace.createdBy} /></td>
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
              <th>Cluster</th>
              <th>Created By</th>
            </tr>
          </thead>
          {
            (() => {
              if (error) return errorTableBody();
              else if (loading) return loadingTableBody();
              else if (!namespaces.count) return emptyTableBody();
              else return NamespacesTableBody();
            })()
          }
        </Table>
        <TablePagination
          pages={namespaces.pages}
          page={namespaces.page}
          limit={namespaces.limit}
          fetchContent={fetchNamespaces}
        />
      </div>
    );
  }
}

NamespacesTable.propTypes = {
  error: PropTypes.object,
  loading: PropTypes.bool,
  namespaces: PropTypes.shape({
    limit: PropTypes.number.isRequired,
    offset: PropTypes.number.isRequired,
    pages: PropTypes.number.isRequired,
    page: PropTypes.number.isRequired,
    count: PropTypes.number.isRequired,
    items: PropTypes.array.isRequired,
  }),
  fetchNamespaces: PropTypes.func,
};

export default NamespacesTable;
