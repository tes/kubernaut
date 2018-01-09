import React, { Component, } from 'react';
import { Link, } from 'react-router-dom';
import PropTypes from 'prop-types';
import TablePagination from '../TablePagination';
import { Human, Ago, } from '../DisplayDate';
import { AccountLink, } from '../Links';
import './DeploymentsTable.css';

class DeploymentsTable extends Component {

  render() {
    const { error = null, loading = false, deployments = {}, fetchDeployments, } = this.props;

    const errorTableBody = () =>
      <tbody className='deployments-table__body deployments-table__body--error'>
        <tr className='deployments-table__body__row'>
          <td className='deployments-table__body__row__info' colSpan='7'>Error loading deployments</td>
        </tr>
      </tbody>
    ;

    const loadingTableBody = () =>
      <tbody className='deployments-table__body deployments-table__body--loading'>
        <tr className='deployments-table__body__row'>
          <td className='deployments-table__body__row__info' colSpan='7'>Loading deployments…</td>
        </tr>
      </tbody>
    ;

    const emptyTableBody = () =>
      <tbody className='deployments-table__body deployments-table__body--empty'>
        <tr className='deployments-table__body__row'>
          <td className='deployments-table__body__row__info' colSpan='7'>There are no deployments</td>
        </tr>
      </tbody>
    ;

    const deploymentsTableBody = () =>
      <tbody className='deployments-table__body deployments-table__body--data'>
      {
        deployments.items.map(deployment => {
          return <tr className='deployments-table__body__row' key={deployment.id} id={deployment.id} >
            <td className='deployments-table__body__row__created-date'>
              <span className="deployments-table__body__row__created-date__on"><Human date={deployment.createdOn} /></span>
              <span className="deployments-table__body__row__created-date__ago"><Ago date={deployment.createdOn} /></span>
            </td>
            <td className='deployments-table__body__row__service-name'>{deployment.release.service.name}</td>
            <td className='deployments-table__body__row__version'>{deployment.release.version}</td>
            <td className='deployments-table__body__row__namespace-name'>{deployment.release.service.namespace.name}</td>
            <td className='deployments-table__body__row__context'>{deployment.context}</td>
            <td className='deployments-table__body__row__created-by'>
              <AccountLink account={deployment.createdBy} />
            </td>
            <td className='deployments-table__body__row__actions'><Link to={`/deployments/${deployment.id}`}><i className="fa fa-external-link" aria-hidden="true"></i></Link></td>
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
              <th className='deployments-table__heading__namespace-name'>Namespace</th>
              <th className='deployments-table__heading__context'>Context</th>
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
          totalPages={deployments.pages}
          currentPage={deployments.currentPage}
          pageSize={deployments.limit}
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
    currentPage: PropTypes.number.isRequired,
    count: PropTypes.number.isRequired,
    items: PropTypes.array.isRequired,
  }),
  fetchDeployments: PropTypes.func,
};

export default DeploymentsTable;
