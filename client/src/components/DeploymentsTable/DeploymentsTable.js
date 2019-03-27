import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Table } from 'reactstrap';
import { isEqual, curry } from 'lodash';
import TablePagination from '../TablePagination';
import { Human, Ago } from '../DisplayDate';
import { AccountLink, ServiceLink, ReleaseLink, NamespaceLink, DeploymentLink } from '../Links';
import TableFilter, { CreateQuickFilters } from '../TableFilter';
import DeploymentStatus from '../DeploymentStatus';

const columns = [
  { key: 'status', label: 'Status', sortable: false },
  { key: 'service', label: 'Service' },
  { key: 'version', label: 'Version' },
  { key: 'created', label: 'Created' },
  { key: 'where', label: 'Where' },
  { key: 'createdBy', label: 'Created By' },
  { key: 'deployLink', label: '', sortable: false }
];

const isEqualC = curry(isEqual);

class DeploymentsTable extends Component {

  render() {
    const {
      error = null,
      loading = false,
      deployments = {},
      fetchDeployments,
      omitColumns = [],
      hideFilters = false,
      toggleSort,
      sort,
      filterActions,
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
    const { QuickFilters, MultiQuickFilters } = !hideFilters ? CreateQuickFilters(filterActions.addFilter)
      : { QuickFilters: () => null, MultiQuickFilters: () => null };

    const deploymentsTableBody = () => {
      const omitService = omitColumns.find(isEqualC('service'));
      const omitVersion = omitColumns.find(isEqualC('version'));
      const omitCreated = omitColumns.find(isEqualC('created'));
      const omitWhere = omitColumns.find(isEqualC('where'));
      const omitStatus = omitColumns.find(isEqualC('status'));
      const omitCreatedBy = omitColumns.find(isEqualC('createdBy'));
      const omitDeployLink = omitColumns.find(isEqualC('deployLink'));

      return (
        <tbody>
          {
            deployments.items.map(deployment => {
              return <tr key={deployment.id} id={deployment.id}>
                { omitStatus ? null : <td className="text-center"><DeploymentStatus deployment={deployment} /></td> }
                { omitService ? null : <td className="cellFilterActionsParent">
                  <ServiceLink service={deployment.release.service} />
                  <QuickFilters value={deployment.release.service.name} column='service' />
                </td> }
                { omitVersion ? null : <td className="cellFilterActionsParent">
                  <ReleaseLink release={deployment.release} />
                  <QuickFilters value={deployment.release.version} column='version' />
                </td> }
                { omitCreated ? null : <td>
                  <span className="mr-4"><Human date={deployment.createdOn} /></span>
                  <span className="font-italic"><Ago date={deployment.createdOn} /></span>
                </td> }
                { omitWhere ? null : <td className="cellFilterActionsParent">
                  <NamespaceLink pill showCluster namespace={deployment.namespace} />
                  <MultiQuickFilters filters={[
                    { value: deployment.namespace.name, column: 'namespace' },
                    { value: deployment.namespace.cluster.name, column: 'cluster' }
                    ]}
                  />
                </td> }
                { omitCreatedBy ? null : <td className="cellFilterActionsParent">
                  <AccountLink account={deployment.createdBy} />
                  <QuickFilters value={deployment.createdBy.displayName} column='createdBy' />
                </td> }
                { omitDeployLink ? null : <td><DeploymentLink deployment={deployment} icon='external-link' /></td> }
              </tr>;
            })
          }
        </tbody>
      );
    }
    ;

    const arrowClass = sort.order === 'asc' ? 'arrow-up' : 'arrow-down';
    const arrowEl = <i className={`fa fa-${arrowClass}`} aria-hidden='true'></i>;

    return (
      <div>
        { hideFilters ?
          null :
          <TableFilter
            formPrefix="deployments"
            statePath="deployments.filter"
            columns={[
              { value: 'service', display: 'Service' },
              { value: 'version', display: 'Version' },
              { value: 'registry', display: 'Registry' },
              { value: 'cluster', display: 'Cluster' },
              { value: 'namespace', display: 'Namespace' },
              { value: 'createdBy', display: 'Created By' },
            ]}
            {...filterActions}
            />
        }
        <Table hover size="sm">
          <thead>
            <tr>
              {columns.map(({ key, label, sortable = true }) => {
                return omitColumns.indexOf(key) > -1 ?
                  null :
                  <th
                    key={key}
                    onClick={ sortable ? () => toggleSort(key) : null }
                    >{label} {sort.column === key ? arrowEl : null}
                  </th>;
              })}
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
          sort={sort.column}
          order={sort.order}
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
