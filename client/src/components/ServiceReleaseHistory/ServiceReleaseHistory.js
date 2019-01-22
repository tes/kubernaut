import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ReactMarkdown from 'react-markdown';
import {
  Table,
  Row,
  Col,
  Button,
  Modal,
  ModalHeader,
  ModalBody,
} from 'reactstrap';
import TablePagination from '../TablePagination';
import { Human } from '../DisplayDate';
import { CreateDeploymentLink, NamespaceLink } from '../Links';

class ServiceReleaseHistory extends Component {

  constructor(props) {
    super(props);
    this.openModal = this.openModal.bind(this);
    this.closeModal = this.closeModal.bind(this);
    this.state = {
      modalOpen: false,
      modalData: {
        version: '',
        deployments: [],
      },
    };
  }

  openModal(item) {
    const deployments = this.props.deploymentsWithNotes.filter(d => d.release.version === item.version);
    this.setState({
      modalOpen: true,
      modalData: {
        service: item.service.name,
        version: item.version,
        deployments,
      }
    });
  }

  closeModal() {
    this.setState({
      modalOpen: false,
    });
  }

  render() {
    const { releases, latestDeployments, deploymentsWithNotes } = this.props;
    const rows = [];
    if (releases && releases.data && releases.data.items) {
      releases.data.items.forEach((item, index) => {
        const deployments = latestDeployments.filter((dep) => (dep.release.id === item.id));
        const deploymentBadges = deployments.map((dep) => (
          <Col key={dep.namespace.id} className="mr-1">
            <NamespaceLink
              namespace={dep.namespace}
              pill
              showCluster
            />
          </Col>
        ));

        rows.push((
          <tr key={item.id} className="row no-gutters">
            <td className="col-1 pb-0">{item.version}</td>
            <td className="col-3 pb-0"><Human date={item.createdOn} /></td>
            <td className="col-auto pb-0">
              <CreateDeploymentLink
                service={item.service}
                registry={item.service.registry}
                version={item.version}
              >
                <i className="fa fa-cloud-upload text-success" aria-hidden='true'></i>
              </CreateDeploymentLink>
            </td>
            <td className="pb-0">
              <Row className="no-gutters">
                {deploymentBadges}
              </Row>
            </td>
          </tr>
        ));
        if (deploymentsWithNotes.filter(d => d.release.version === item.version).length) {
          rows.push((
            <tr key={`${item.id}-notes`}>
              <td colSpan="3" className="py-0">
                <p className="m-0 d-inline align-middle pr-1">
                  <small>This release has had deployment notes.</small>
                </p>
                <Button
                  className="d-inline p-0 border-0"
                  color="link"
                  onClick={() => this.openModal(item)}
                >
                  <small>View</small>
                </Button>
              </td>
            </tr>
          ));
        }
      });
    }

    const modalData = this.state.modalData;
    return (
      <Row>
        <Col>
          <Table size="sm" borderless>
            <thead>
              <tr className="row no-gutters">
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
        <Modal
          isOpen={this.state.modalOpen}
          toggle={this.closeModal}
          size="lg"
          >
          <ModalHeader>
            Deployment notes for {modalData.service}@{modalData.version}:
          </ModalHeader>
          <ModalBody>
            <Row>
              <Col>
                {modalData.deployments.map(d => (
                  <Row key={d.id} className="my-2 p-1 border-bottom bg-light">
                    <Col>
                      <Row>
                        <Col>
                          <Human date={d.createdOn} />
                        </Col>
                        <Col>
                          <div className="d-flex w-100">
                            <div className="mr-1"><strong>Where:</strong></div>
                            <div><NamespaceLink namespace={d.namespace} pill showCluster /></div>
                          </div>
                        </Col>
                      </Row>
                      <Row>
                        <Col>
                          <ReactMarkdown
                            className="text-light bg-dark p-1 mx-2"
                            source={d.note}
                            />
                        </Col>
                      </Row>
                    </Col>
                  </Row>
                ))}
              </Col>
            </Row>
          </ModalBody>
        </Modal>
      </Row>
    );
  }
}

ServiceReleaseHistory.propTypes = {
  releases: PropTypes.object,
  latestDeployments: PropTypes.array,
};

export default ServiceReleaseHistory;
