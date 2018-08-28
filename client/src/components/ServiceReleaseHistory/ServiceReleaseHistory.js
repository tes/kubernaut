import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Table, Row, Col } from 'reactstrap';
import TablePagination from '../TablePagination';
import { CreateDeploymentLink, NamespaceLink } from '../Links';

class ServiceReleaseHistory extends Component {

  render() {
    const { releases, latestDeployments } = this.props;
    const rows = [];
    if (releases && releases.data && releases.data.items) {
      releases.data.items.forEach((item) => {
        const deployments = latestDeployments.filter((dep) => (dep.release.id === item.id));
        const deploymentBadges = deployments.map((dep) => (
          <Col key={dep.namespace.id}>
            <NamespaceLink
              namespace={dep.namespace}
              pill
              showCluster
            />
          </Col>
        ));

        rows.push((
          <tr key={item.id} className="row">
            <td className="col-1">{item.version}</td>
          <td className="col-3">{item.createdOn}</td>
            <td className="col-auto">
              <CreateDeploymentLink
                service={item.service}
                registry={item.service.registry}
                version={item.version}
              >
                <i className="fa fa-cloud-upload" aria-hidden='true'></i>
              </CreateDeploymentLink>
            </td>
            <td>
              <Row>
                {deploymentBadges}
              </Row>
            </td>

          </tr>
        ));
      });
    }
    return (
      <div>
        <Row>
          <Col md="12">
            <Table size="sm" borderless>
              <thead>
                <tr className="row">
                  <th className="col-1">Version</th>
                  <th className="col-3">When</th>
                </tr>
              </thead>
              <tbody>
                {rows}
              </tbody>
            </Table>
            <TablePagination
              pages={releases.data.pages}
              page={releases.data.page}
              limit={releases.data.limit}
              fetchContent={this.props.paginationFunc}
            />
          </Col>
        </Row>
      </div>
    );
  }
}

ServiceReleaseHistory.propTypes = {
  releases: PropTypes.object,
  latestDeployments: PropTypes.array,
};

export default ServiceReleaseHistory;
