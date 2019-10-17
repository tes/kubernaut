import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Row, Col, Table } from 'reactstrap';
import Title from '../Title';
import { RegistryLink, ServiceLink } from '../Links';
import { TeamSubNav } from '../SubNavs';

class TeamPage extends Component {

  render() {
    const team = this.props.team.data;

    const teamAttributes = [];
    for (const attribute in team.attributes) {
      teamAttributes.push(
        <dl className="d-flex mb-0" key={attribute}>
          <dt className="text-right mr-1">{attribute}:</dt>
          <dd className="flex-fill mb-0">{team.attributes[attribute]}</dd>
        </dl>
      );
    }

    return (
      <Row className="page-frame">
        <Col>
          <Title title={`Team: ${team.name}`}/>
          <TeamSubNav team={team} canEdit={this.props.canEdit} />

          <dl className="row">
            <dt className="col-md-3">Attributes:</dt>
            <dd className="col-md-9">
              {teamAttributes}
            </dd>
          </dl>

          <Row>
            <Col>
              <h5>Services:</h5>
            </Col>
          </Row>
          <Row>
            <Col>
              <Table hover size="sm">
                <thead>
                  <tr>
                  <th>Service</th>
                  <th>Registry</th>
                  </tr>
                </thead>
                <tbody>
                {
                  team.services.map(service => (
                    <tr key={service.id}>
                      <td><ServiceLink service={service} /></td>
                      <td><RegistryLink registry={service.registry} /></td>
                    </tr>
                  ))
                }
                </tbody>
              </Table>
            </Col>
          </Row>
        </Col>
      </Row>
    );
  }
}

TeamPage.propTypes = {
  team: PropTypes.object.isRequired,
};

export default TeamPage;
