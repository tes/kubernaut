import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Badge, Button, Container, Row, Col } from 'reactstrap';
import Title from '../Title';
import DeploymentsTable from '../DeploymentsTable';
import { EditNamespaceLink, ManageNamespaceLink } from '../Links';

class NamespaceDetailsPage extends Component {

  render() {
    const namespace = this.props.namespace.data;

    const namespaceAttributes = [];
    for (const attribute in namespace.attributes) {
      namespaceAttributes.push(<dt key={attribute} className="col-md-3">{attribute}:</dt>);
      namespaceAttributes.push(<dd
        key={`${attribute}-${namespace.attributes[attribute]}`}
        className="col-md-9"
      >{namespace.attributes[attribute]}
      </dd>);
    }

    const headingBadge = <Badge style={{ backgroundColor: namespace.color || namespace.cluster.color }} pill>{namespace.cluster.name}/{namespace.name}</Badge>;

    return (
      <Container className="page-frame">
        <Title title={`Namespace: ${namespace.cluster.name}/${namespace.name}`}/>
        <Row>
          <Col className="d-flex">
            <h4>{headingBadge}</h4>
            { this.props.canEdit ?
              <EditNamespaceLink namespaceId={this.props.namespaceId}>
                <Button color="link">edit</Button>
              </EditNamespaceLink>
              : null }

              { this.props.canManage ?
                <ManageNamespaceLink namespaceId={this.props.namespaceId}>
                  <Button color="link">manage</Button>
                </ManageNamespaceLink>
                : null }
          </Col>
        </Row>

        <dl className="row">
          <dt className="col-md-3">Context:</dt>
          <dd className="col-md-9">{namespace.context}</dd>

          <dt className="col-md-3">Attributes:</dt>
          <dd className="col-md-9">
            <dl className="row">
              {namespaceAttributes}
            </dl>
          </dd>
        </dl>

        <Row>
          <Col>
            <h5>Deployments for this namespace:</h5>
          </Col>
        </Row>
        <Row>
          <Col>
            <DeploymentsTable
              deployments={this.props.deployments.data}
              loading={this.props.deployments.meta.loading}
              error={this.props.deployments.meta.error}
              fetchDeployments={(options) => {
                this.props.fetchDeploymentsPagination({
                  ...options,
                  id: this.props.namespaceId,
                });
              }}
              sort={this.props.deployments.sort}
              toggleSort={this.props.toggleSort}
              omitColumns={['where']}
              hideFilters
            />
          </Col>
        </Row>
      </Container>
    );
  }
}

NamespaceDetailsPage.propTypes = {
  namespaceId: PropTypes.string.isRequired,
  namespace: PropTypes.object.isRequired,
  deployments: PropTypes.object.isRequired,
};

export default NamespaceDetailsPage;
