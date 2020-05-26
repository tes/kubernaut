import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Table } from 'reactstrap';
import TablePagination from '../TablePagination';
import { TeamLink } from '../Links';

class TeamsTable extends Component {

  render() {
    const { teams = {}, fetchTeams } = this.props;

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
            <td className="text-center"><span>{team.servicesCount}</span></td>
            <td className="text-center"><span>{team.accountsCount}</span></td>
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
              <th className="text-center">Services</th>
              <th className="text-center">Members</th>
            </tr>
          </thead>
          {
            (() => {
              if (!teams.count) return emptyTableBody();
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
