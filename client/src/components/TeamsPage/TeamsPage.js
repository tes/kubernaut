import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Row, Col } from 'reactstrap';
import TeamsTable from '../TeamsTable';

class TeamsPage extends Component {

  render() {
    const { teams, fetchTeamsPagination } = this.props;

    return (
      <div className='page-frame'>
        <Row>
          <Col md="6">
            <TeamsTable teams={teams.data} loading={teams.meta.loading} error={teams.meta.error} fetchNamespaces={fetchTeamsPagination} />
          </Col>
        </Row>
      </div>
    );
  }
}

TeamsPage.propTypes = {
  teams: PropTypes.object,
};

export default TeamsPage;
