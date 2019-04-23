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
  UncontrolledTooltip,
} from 'reactstrap';
import { sortBy } from 'lodash';
import TablePagination from '../TablePagination';
import { Human, Ago } from '../DisplayDate';
import { CreateDeploymentLink, NamespaceLink, DeploymentLink } from '../Links';

const trimWithoutCuttingWord = (string, maxLength) => {
  const newStringSimple = string.substring(0, maxLength);
  const newStringCutToWord = newStringSimple.substring(0, newStringSimple.lastIndexOf(' '));

  return newStringCutToWord || newStringSimple;
};

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
    const { releases, latestDeployments, deploymentsWithNotes, releasesNamespaceHistory } = this.props;
    const rows = [];
    if (releases && releases.data && releases.data.items) {
      releases.data.items.forEach((item, index) => {
        const activeDeployments = latestDeployments.filter((dep) => (dep.release.id === item.id));
        const historicalDeployments = sortBy(releasesNamespaceHistory
          .filter((dep) => (dep.release.id === item.id)), ['cluster.priority', 'cluster.name', 'namespace.name']);
        const deploymentBadges = historicalDeployments.map((dep) => {
          const hasActive = activeDeployments.find(activeDep => (
            dep.namespace.id === activeDep.namespace.id
          ));

          return (
            <div key={dep.namespace.id} className="mr-1" style={{ opacity: hasActive ? '1' : '0.2'}}>
              <NamespaceLink
                namespace={dep.namespace}
                pill
                showCluster
              />
          </div>
          );
        });

        const releaseComment = item.comment ? (
          item.comment.length < 30 ? item.comment : (
            <span>
              <span id={`comment-${item.id}`}>{trimWithoutCuttingWord(item.comment, 30)} ...</span>
              <UncontrolledTooltip delay={250} target={`comment-${item.id}`} placement="right">
                {item.comment}
              </UncontrolledTooltip>
            </span>
          )
        ) : null;

        rows.push((
          <tr key={item.id}>
            <td className="pb-0 text-center">{item.version}</td>
            <td className="pb-0"><Ago date={item.createdOn} /></td>
            <td className="pb-0">{releaseComment}</td>
            <td className="pb-0">
              <CreateDeploymentLink
                service={item.service}
                registry={item.service.registry}
                version={item.version}
              >
                <h5 className="m-0">
                  <i
                    className="fa fa-cloud-upload text-info"
                    aria-hidden='true'
                    title="Deploy this release"
                  ></i>
                </h5>
              </CreateDeploymentLink>
            </td>
            <td className="pb-0">
              <div className="d-flex">
                {deploymentBadges}
              </div>
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
          <Table size="sm" className="table-responsive" borderless>
            <thead>
              <tr>
                <th className="text-center">Version</th>
                <th>When</th>
                <th>Message</th>
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
                        <Col className="text-right">
                          <DeploymentLink deployment={d}>View deployment</DeploymentLink>
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
