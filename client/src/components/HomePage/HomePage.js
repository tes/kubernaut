import React, { Component } from 'react';
import {
  Row,
  Col,
  Card,
  CardHeader,
  CardBody,
  Table,
} from 'reactstrap';
import {
  ServiceLink,
  ReleaseLink,
  RegistryLink,
  NamespaceLink,
  DeploymentLink,
} from '../Links';

class HomePage extends Component {

  render() {
    return (
      <div className='container page-frame'>
        <Row>
          <Col>
            <Card>
              <CardHeader className="py-1 px-2">Recent releases</CardHeader>
              <CardBody className="py-1 px-2">
                <Table hover size="sm">
                  <thead>
                    <tr>
                      <th className="border-top-0">Service</th>
                      <th className="border-top-0 text-center">Version</th>
                      <th className="border-top-0">Registry</th>
                    </tr>
                  </thead>
                  <tbody>
                    {
                      this.props.releases.map(release => (
                        <tr key={release.id}>
                          <td><ServiceLink service={release.service}/></td>
                          <td className="text-center"><ReleaseLink release={release}/></td>
                          <td><RegistryLink registry={release.service.registry}/></td>
                        </tr>
                      ))
                    }
                  </tbody>
                </Table>
              </CardBody>
            </Card>
          </Col>
          <Col>
            <Card>
              <CardHeader className="py-1 px-2">Recent deployments</CardHeader>
              <CardBody className="py-1 px-2">
                <Table hover size="sm">
                  <thead>
                    <tr>
                      <th className="border-top-0">Service</th>
                      <th className="border-top-0 text-center">Version</th>
                      <th className="border-top-0">Namespace</th>
                      <th className="border-top-0"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {
                      this.props.deployments.map(dep => (
                        <tr key={dep.id}>
                          <td><ServiceLink service={dep.release.service}/></td>
                          <td className="text-center"><ReleaseLink release={dep.release}/></td>
                          <td><NamespaceLink namespace={dep.namespace} pill showCluster/></td>
                          <td><DeploymentLink deployment={dep} icon='external-link' /></td>
                        </tr>
                      ))
                    }
                  </tbody>
                </Table></CardBody>
            </Card>
          </Col>
        </Row>
      </div>
    );
  }
}

export default HomePage;
