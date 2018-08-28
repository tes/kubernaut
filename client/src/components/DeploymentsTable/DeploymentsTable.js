import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Table } from 'reactstrap';
import TablePagination from '../TablePagination';
import { Human, Ago } from '../DisplayDate';
import { AccountLink, ServiceLink, ReleaseLink, ClusterLink, NamespaceLink, DeploymentLink } from '../Links';

const columns = [
  { key: 'service', label: 'Service' },
  { key: 'version', label: 'Version' },
  { key: 'created', label: 'Created' },
  { key: 'cluster', label: 'Cluster' },
  { key: 'namespace', label: 'Namespace' },
  { key: 'status', label: 'Status' },
  { key: 'createdBy', label: 'Created By' },
  { key: 'deployLink', label: '' }
];

class DeploymentsTable extends Component {

  render() {
    const {
      error = null,
      loading = false,
      deployments = {},
      fetchDeployments,
      omitColumns = [],
    } = this.props;

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

    const deploymentsTableBody = () => {
      const omitService = omitColumns.indexOf('service') > -1;
      const omitVersion = omitColumns.indexOf('version') > -1;
      const omitCreated = omitColumns.indexOf('created') > -1;
      const omitCluster = omitColumns.indexOf('cluster') > -1;
      const omitNamespace = omitColumns.indexOf('namespace') > -1;
      const omitStatus = omitColumns.indexOf('status') > -1;
      const omitCreatedBy = omitColumns.indexOf('createdBy') > -1;
      const omitDeployLink = omitColumns.indexOf('deployLink') > -1;

      return (
        <tbody>
          {
            deployments.items.map(deployment => {
              return <tr key={deployment.id} id={deployment.id} >
                { omitService ? null : <td><ServiceLink service={deployment.release.service} /></td> }
                { omitVersion ? null : <td><ReleaseLink release={deployment.release} /></td> }
                { omitCreated ? null : <td>
                  <span className="mr-4"><Human date={deployment.createdOn} /></span>
                  <span className="font-italic"><Ago date={deployment.createdOn} /></span>
                </td> }
                { omitCluster ? null : <td><ClusterLink cluster={deployment.namespace.cluster} /></td> }
                { omitNamespace ? null : <td><NamespaceLink namespace={deployment.namespace} /></td> }
                { omitStatus ? null : <td>{deployment.status}</td> }
                { omitCreatedBy ? null : <td>
                  <AccountLink account={deployment.createdBy} />
                </td> }
                { omitDeployLink ? null : <td><DeploymentLink deployment={deployment} icon='external-link' /></td> }
              </tr>;
            })
          }
        </tbody>
      );
    }
    ;

    return (
      <div>
        <Table hover size="sm">
          <thead>
            <tr>
              {columns.map(({ key, label }) => (omitColumns.indexOf(key) > -1 ? null : <th>{label}</th>))}
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
  omitColumns: PropTypes.array,
};

export default DeploymentsTable;
