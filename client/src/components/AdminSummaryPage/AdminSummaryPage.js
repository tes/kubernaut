import React, { Component } from 'react';
import {
  Row,
  Col,
  Card,
  CardBody,
  ListGroup,
  ListGroupItem,
  Badge,
} from 'reactstrap';
import { AdminSubNav } from '../SubNavs';

class AdminSummaryPage extends Component {

  render() {
    const { canAudit, summary } = this.props;

    return (
      <Row className='page-frame'>
        <Col md className="mb-2">
          <AdminSubNav canAudit={canAudit} />

          <Row>
            <Col md="5">
              <Card>
                <CardBody>
                  <ListGroup>
                    <ListGroupItem className="d-flex justify-content-between align-items-center">Accounts<Badge pill>{summary.data.accounts}</Badge></ListGroupItem>
                    <ListGroupItem className="d-flex justify-content-between align-items-center">Clusters<Badge pill>{summary.data.clusters}</Badge></ListGroupItem>
                    <ListGroupItem className="d-flex justify-content-between align-items-center">Deployments<Badge pill>{summary.data.deployments}</Badge></ListGroupItem>
                    <ListGroupItem className="d-flex justify-content-between align-items-center">Cronjobs<Badge pill>{summary.data.jobs}</Badge></ListGroupItem>
                    <ListGroupItem className="d-flex justify-content-between align-items-center">Namespaces<Badge pill>{summary.data.namespaces}</Badge></ListGroupItem>
                    <ListGroupItem className="d-flex justify-content-between align-items-center">Registries<Badge pill>{summary.data.registries}</Badge></ListGroupItem>
                    <ListGroupItem className="d-flex justify-content-between align-items-center">Releases<Badge pill>{summary.data.releases}</Badge></ListGroupItem>
                    <ListGroupItem className="d-flex justify-content-between align-items-center">Services<Badge pill>{summary.data.services}</Badge></ListGroupItem>
                    <ListGroupItem className="d-flex justify-content-between align-items-center">Teams<Badge pill>{summary.data.teams}</Badge></ListGroupItem>
                  </ListGroup>
                </CardBody>
              </Card>
            </Col>
          </Row>
        </Col>
      </Row>
    );
  }
}

export default AdminSummaryPage;
