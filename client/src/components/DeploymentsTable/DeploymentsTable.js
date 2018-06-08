import React, { Component } from 'react';
import PropTypes from 'prop-types';
import TablePagination from '../TablePagination';
import { Human, Ago } from '../DisplayDate';
import { AccountLink, ServiceLink, ReleaseLink, ClusterLink, NamespaceLink, DeploymentLink } from '../Links';
import './DeploymentsTable.css';

class DeploymentsTable extends Component {

  render() {
    const { error = null, loading = false, deployments = {}, fetchDeployments } = this.props;

    const errorTableBody = () =>
      <tbody className='deployments-table__body deployments-table__body--error'>
        <tr className='deployments-table__body__row'>
          <td className='deployments-table__body__row__info' colSpan='8'>Error loading deployments</td>
        </tr>
      </tbody>
    ;

    const loadingTableBody = () =>
      <tbody className='deployments-table__body deployments-table__body--loading'>
        <tr className='deployments-table__body__row'>
          <td className='deployments-table__body__row__info' colSpan='8'>Loading deployments…</td>
        </tr>
      </tbody>
    ;

    const emptyTableBody = () =>
      <tbody className='deployments-table__body deployments-table__body--empty'>
        <tr className='deployments-table__body__row'>
          <td className='deployments-table__body__row__info' colSpan='8'>There are no deployments</td>
        </tr>
      </tbody>
    ;

    const deploymentsTableBody = () =>
      <tbody className='deployments-table__body deployments-table__body--data'>
      {
        deployments.items.map(deployment => {
          return <tr className={`deployments-table__body__row deployments-table__body__row--${deployment.status}`} key={deployment.id} id={deployment.id} >
            <td className='deployments-table__body__row__created-date'>
              <span className='deployments-table__body__row__created-date__on'><Human date={deployment.createdOn} /></span>
              <span className='deployments-table__body__row__created-date__ago'><Ago date={deployment.createdOn} /></span>
            </td>
            <td className='deployments-table__body__row__service-name'><ServiceLink service={deployment.release.service} /></td>
            <td className='deployments-table__body__row__version'><ReleaseLink release={deployment.release} /></td>
            <td className='deployments-table__body__row__cluster-name'><ClusterLink cluster={deployment.namespace.cluster} /></td>
            <td className='deployments-table__body__row__namespace-name'><NamespaceLink namespace={deployment.namespace} /></td>
            <td className='deployments-table__body__row__status'>{deployment.status}</td>
            <td className='deployments-table__body__row__created-by'>
              <AccountLink account={deployment.createdBy} />
            </td>
            <td className='deployments-table__body__row__actions'><DeploymentLink deployment={deployment} icon='external-link' /></td>
          </tr>;
        })
      }
      </tbody>
    ;

    return (
      <div>
        <table className='deployments-table table table-condensed table-hover'>
          <thead className='deployments-table__heading'>
            <tr>
              <th className='deployments-table__heading__created-date'>Created</th>
              <th className='deployments-table__heading__service-name'>Service</th>
              <th className='deployments-table__heading__version'>Version</th>
              <th className='deployments-table__heading__cluster-name'>Cluster</th>
              <th className='deployments-table__heading__namespace-name'>Namespace</th>
              <th className='deployments-table__heading__status'>Status</th>
              <th className='deployments-table__heading__created-by'>Created By</th>
              <th className='deployments-table__heading__actions'>&nbsp;</th>
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
        </table>
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
