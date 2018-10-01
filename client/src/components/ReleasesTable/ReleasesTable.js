import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Table } from 'reactstrap';
import TablePagination from '../TablePagination';
import { Human, Ago } from '../DisplayDate';
import { AccountLink, RegistryLink, ServiceLink, ReleaseLink, CreateDeploymentLink } from '../Links';
import TableFilter from '../TableFilter';

class ReleasesTable extends Component {

  render() {
    const {
      error = null,
      loading = false,
      releases = {},
      fetchReleases,
      toggleSort,
      sort,
      filterActions,
    } = this.props;

    const errorTableBody = () =>
      <tbody>
        <tr>
          <td colSpan='5'>Error loading releases</td>
        </tr>
      </tbody>
    ;

    const loadingTableBody = () =>
      <tbody>
        <tr>
          <td colSpan='5'>Loading releases…</td>
        </tr>
      </tbody>
    ;

    const emptyTableBody = () =>
      <tbody>
        <tr>
          <td colSpan='5'>There are no releases</td>
        </tr>
      </tbody>
    ;

    const releasesTableBody = () =>
      <tbody>
      {
        releases.items.map(release => {
          return <tr key={release.id} id={release.id} >
            <td>
              <span className="mr-4"><Human date={release.createdOn} /></span>
              <span className="font-italic"><Ago date={release.createdOn} /></span>
            </td>
            <td><ServiceLink service={release.service} /></td>
            <td><ReleaseLink release={release} /></td>
            <td><RegistryLink registry={release.service.registry} /></td>
            <td><AccountLink account={release.createdBy} /></td>
            <td>
              <CreateDeploymentLink
                service={release.service}
                registry={release.service.registry}
                version={release.version}
              />
            </td>
          </tr>;
        })
      }
      </tbody>
    ;

    const arrowClass = sort.order === 'asc' ? 'arrow-up' : 'arrow-down';
    const arrowEl = <i className={`fa fa-${arrowClass}`} aria-hidden='true'></i>;
    const sortIcons = {
      created: sort.column === 'created' ? arrowEl : null,
      service: sort.column === 'service' ? arrowEl : null,
      version: sort.column === 'version' ? arrowEl : null,
      registry: sort.column === 'registry' ? arrowEl : null,
      createdBy: sort.column === 'createdBy' ? arrowEl : null,
    };


    return (
      <div>
        <TableFilter
          formPrefix="releases"
          statePath="releases.filter"
          columns={[
            { value: 'service', display: 'Service' },
            { value: 'version', display: 'Version' },
            { value: 'registry', display: 'Registry' },
            { value: 'createdBy', display: 'Created By' },
          ]}
          {...filterActions}
        />
        <Table hover size="sm">
          <thead>
            <tr>
              <th onClick={() => toggleSort('created')}>Created {sortIcons['created']}</th>
              <th onClick={() => toggleSort('service')}>Service {sortIcons['service']}</th>
              <th onClick={() => toggleSort('version')}>Version {sortIcons['version']}</th>
              <th onClick={() => toggleSort('registry')}>Registry {sortIcons['registry']}</th>
              <th onClick={() => toggleSort('createdBy')}>Created By {sortIcons['createdBy']}</th>
            </tr>
          </thead>
          {
            (() => {
              if (error) return errorTableBody();
              else if (loading) return loadingTableBody();
              else if (!releases.count) return emptyTableBody();
              else return releasesTableBody();
            })()
          }
        </Table>
        <TablePagination
          pages={releases.pages}
          page={releases.page}
          limit={releases.limit}
          fetchContent={fetchReleases}
          sort={sort.column}
          order={sort.order}
        />
      </div>
    );
  }
}

ReleasesTable.propTypes = {
  error: PropTypes.object,
  loading: PropTypes.bool,
  releases: PropTypes.shape({
    limit: PropTypes.number.isRequired,
    offset: PropTypes.number.isRequired,
    pages: PropTypes.number.isRequired,
    page: PropTypes.number.isRequired,
    count: PropTypes.number.isRequired,
    items: PropTypes.array.isRequired,
  }),
  fetchReleases: PropTypes.func,
};

export default ReleasesTable;
