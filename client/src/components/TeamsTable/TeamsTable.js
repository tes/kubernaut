import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Table } from 'reactstrap';
import TablePagination from '../TablePagination';
import { TeamLink } from '../Links';

class TeamsTable extends Component {

  render() {
    const { error = null, loading = false, teams = {}, fetchTeams } = this.props;

    const errorTableBody = () =>
      <tbody>
        <tr>
          <td colSpan='4'>Error loading teams</td>
        </tr>
      </tbody>
    ;

    const loadingTableBody = () =>
      <tbody>
        <tr>
          <td colSpan='4'>Loading teams…</td>
        </tr>
      </tbody>
    ;

    const emptyTableBody = () =>
      <tbody>
        <tr>
          <td colSpan='4'>There are no teams</td>
        </tr>
      </tbody>
    ;

    const TeamsTableBody = () =>
      <tbody>
      {
        teams.items.map(team => {
          return <tr key={team.id} >
            <td><TeamLink team={team} /></td>
            <td><span>{team.servicesCount}</span></td>
            <td><span>{team.accountsCount}</span></td>
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
              <th>Services</th>
              <th>Members</th>
            </tr>
          </thead>
          {
            (() => {
              if (error) return errorTableBody();
              else if (loading) return loadingTableBody();
              else if (!teams.count) return emptyTableBody();
              else return TeamsTableBody();
            })()
          }
        </Table>
        <TablePagination
          pages={teams.pages}
          page={teams.page}
          limit={teams.limit}
          fetchContent={fetchTeams}
        />
      </div>
    );
  }
}

TeamsTable.propTypes = {
  error: PropTypes.object,
  loading: PropTypes.bool,
  teams: PropTypes.shape({
    limit: PropTypes.number.isRequired,
    offset: PropTypes.number.isRequired,
    pages: PropTypes.number.isRequired,
    page: PropTypes.number.isRequired,
    count: PropTypes.number.isRequired,
    items: PropTypes.array.isRequired,
  }),
  fetchTeams: PropTypes.func,
};

export default TeamsTable;
