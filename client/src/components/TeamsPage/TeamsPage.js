import React, { Component } from 'react';
import PropTypes from 'prop-types';

import TeamsTable from '../TeamsTable';

class TeamsPage extends Component {

  render() {
    const { teams, fetchTeamsPagination } = this.props;

    return (
      <div className='row page-frame'>
        <div className='col-sm'>
          <TeamsTable teams={teams.data} loading={teams.meta.loading} error={teams.meta.error} fetchNamespaces={fetchTeamsPagination} />
        </div>
      </div>
    );
  }
}

TeamsPage.propTypes = {
  teams: PropTypes.object,
};

export default TeamsPage;
