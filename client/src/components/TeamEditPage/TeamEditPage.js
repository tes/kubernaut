import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Row, Col, Progress } from 'reactstrap';
import Title from '../Title';
import { TeamSubNav } from '../SubNavs';
import TeamTeamsRolesForm from '../TeamTeamsRolesForm';
import TeamNamespacesRolesForm from '../TeamNamespacesRolesForm';
import TeamRegistriesRolesForm from '../TeamRegistriesRolesForm';
import TeamSystemRolesForm from '../TeamSystemRolesForm';

class TeamEditPage extends Component {

  render() {
    const {
      meta,
      team,
    } = this.props;
    if (meta.loading.loadingPercent !== 100) return (
      <Row className="page-frame d-flex justify-content-center">
        <Col sm="12" className="mt-5">
          <Progress animated color="info" value={meta.loading.loadingPercent} />
        </Col>
      </Row>
    );

    if (!this.props.canEdit) {
      return (
        <Row className="page-frame">
          <Col xs="12">
            <p>You are not authorised to view this page.</p>
          </Col>
        </Row>
      );
    }

    return (
      <Row className="page-frame">
        <Col>
          <Title title={`Edit team: ${team.name}`} />
          <TeamSubNav team={team} canEdit={this.props.canEdit} />
          <Row>
            <Col>
              <p><strong>Created:</strong> {team.createdOn}</p>
            </Col>
          </Row>
          <Row className="mt-1">
            <Col sm="12">
              <h5>System Roles:</h5>
              <TeamSystemRolesForm team={team} />
            </Col>
          </Row>
          <Row className="mt-3">
            <Col sm="12">
              <h5>Teams:</h5>
              <TeamTeamsRolesForm />
            </Col>
          </Row>
          <Row className="mt-3">
            <Col sm="12">
              <h5>Namespaces:</h5>
              <TeamNamespacesRolesForm />
            </Col>
          </Row>
          <Row className="mt-3">
            <Col sm="12">
              <h5>Registries:</h5>
              <TeamRegistriesRolesForm />
            </Col>
          </Row>
        </Col>
      </Row>
    );
  }
}

TeamEditPage.propTypes = {
  team: PropTypes.object.isRequired,
  meta: PropTypes.object.isRequired,
};

export default TeamEditPage;
