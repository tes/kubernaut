import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Row, Col, Table, Progress } from 'reactstrap';
import TeamsTable from '../TeamsTable';
import TablePagination from '../TablePagination';
import { RegistryLink, ServiceLink, AccountLink } from '../Links';

class TeamsPage extends Component {

  render() {
    const {
      teams,
      services,
      accounts,
      fetchTeamsPagination,
      meta
    } = this.props;

    if (meta.loading.loadingPercent !== 100) return (
        <Row className="page-frame d-flex justify-content-center">
          <Col sm="12" className="mt-5">
            <Progress animated color="info" value={meta.loading.loadingPercent} />
          </Col>
        </Row>
    );

    return (
      <Row className='page-frame'>
        <Col>
          <Row>
            <Col md="9">
              <TeamsTable teams={teams.data} fetchTeams={fetchTeamsPagination} />
            </Col>
          </Row>
          <Row>
            {
              services.data.count ? (
                <Col md="6">
                  <Row>
                    <Col>
                      <h5>Services without a team</h5>
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
                            services.data.items.map(service => (
                              <tr key={service.id}>
                                <td><ServiceLink service={service} /></td>
                                <td><RegistryLink registry={service.registry} /></td>
                              </tr>
                            ))
                          }
                        </tbody>
                      </Table>
                      <TablePagination
                        pages={services.data.pages}
                        page={services.data.page}
                        limit={services.data.limit}
                        fetchContent={this.props.fetchServicesPagination}
                        />
                    </Col>
                  </Row>
                </Col>
              ) : null
            }
            {
              services.data.count ? (
                <Col>
                </Col>
              ) : null
            }
            {
              accounts.data.count ? (
                <Col md="5">
                  <Row>
                    <Col>
                      <h5>Accounts with no membership</h5>
                    </Col>
                  </Row>
                  <Row>
                    <Col>
                      <Table hover size="sm">
                        <thead>
                          <tr>
                            <th>Name</th>
                          </tr>
                        </thead>
                        <tbody>
                          {
                            accounts.data.items.map(account => (
                              <tr key={account.id}>
                                <td><AccountLink account={account} /></td>
                              </tr>
                            ))
                          }
                        </tbody>
                      </Table>
                      <TablePagination
                        pages={accounts.data.pages}
                        page={accounts.data.page}
                        limit={accounts.data.limit}
                        fetchContent={this.props.fetchAccountsPagination}
                        />
                    </Col>
                  </Row>
                </Col>
              ) : null
            }
          </Row>
        </Col>
      </Row>
    );
  }
}

TeamsPage.propTypes = {
  teams: PropTypes.object,
};

export default TeamsPage;
