import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Table } from 'reactstrap';
import TablePagination from '../TablePagination';
import { Human, Ago } from '../DisplayDate';
import { AccountLink, ServiceLink, ReleaseLink, ClusterLink, NamespaceLink, DeploymentLink } from '../Links';

class DeploymentsTable extends Component {

  render() {
    const { error = null, loading = false, deployments = {}, fetchDeployments } = this.props;

    const errorTableBody = () =>
      <tbody>
        <tr>
          <td colSpan='8'>Error loading deployments</td>
        </tr>
      </tbody>
    ;

    const loadingTableBody = () =>
      <tbody>
        <tr>
          <td colSpan='8'>Loading deployments…</td>
        </tr>
      </tbody>
    ;

    const emptyTableBody = () =>
      <tbody>
        <tr>
          <td colSpan='8'>There are no deployments</td>
        </tr>
      </tbody>
    ;

    const deploymentsTableBody = () =>
      <tbody>
      {
        deployments.items.map(deployment => {
          return <tr className={`deployments-table__body__row deployments-table__body__row--${deployment.status}`} key={deployment.id} id={deployment.id} >
            <td><ServiceLink service={deployment.release.service} /></td>
            <td><ReleaseLink release={deployment.release} /></td>
            <td>
              <span className="mr-4"><Human date={deployment.createdOn} /></span>
              <span className="font-italic"><Ago date={deployment.createdOn} /></span>
            </td>
            <td><ClusterLink cluster={deployment.namespace.cluster} /></td>
            <td><NamespaceLink namespace={deployment.namespace} /></td>
            <td>{deployment.status}</td>
            <td>
              <AccountLink account={deployment.createdBy} />
            </td>
            <td><DeploymentLink deployment={deployment} icon='external-link' /></td>
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
              <th>Service</th>
              <th>Version</th>
              <th>Created</th>
              <th>Cluster</th>
              <th>Namespace</th>
              <th>Status</th>
              <th>Created By</th>
              <th>&nbsp;</th>
            </tr>
          </thead>
          {
            (() => {
              if (error) return errorTableBody();
              else if (loading) return loadingTableBody();
              else if (!deployments.count) return emptyTableBody();
              else return deploymentsTableBody();
            })()
          }
        </Table>
        <TablePagination
          pages={deployments.pages}
          page={deployments.page}
          limit={deployments.limit}
          fetchContent={fetchDeployments}
        />
      </div>
    );
  }
}

DeploymentsTable.propTypes = {
  error: PropTypes.object,
  loading: PropTypes.bool,
  deployments: PropTypes.shape({
    limit: PropTypes.number.isRequired,
    offset: PropTypes.number.isRequired,
    pages: PropTypes.number.isRequired,
    page: PropTypes.number.isRequired,
    count: PropTypes.number.isRequired,
    items: PropTypes.array.isRequired,
  }),
  fetchDeployments: PropTypes.func,
};

export default DeploymentsTable;
