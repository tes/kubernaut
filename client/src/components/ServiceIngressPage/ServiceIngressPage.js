import React, { Component } from 'react';
import {
  Row,
  Col,
  Card,
  CardBody,
  Button,
  Progress,
  ListGroup,
  ListGroupItem,
} from 'reactstrap';
import Title from '../Title';
import { ServicesSubNav } from '../SubNavs';
import TablePagination from '../TablePagination';
import { NewIngressVersionLink, IngressVersionsLink } from '../Links';
import { Ago } from '../DisplayDate';

class ServiceIngress extends Component {

  render() {

    const {
      service,
      meta,
      canManage,
      team,
      canWriteIngress,
      versions,
      fetchVersionsPagination,
      version,
      versionId,
    } = this.props;

    if (meta.loading.loadingPercent !== 100) return (
      <Row className="page-frame d-flex justify-content-center">
        <Col sm="12" className="mt-5">
          <Progress animated color="info" value={meta.loading.loadingPercent} />
        </Col>
      </Row>
    );


    return (
      <Row className="page-frame">
        <Col>
          <Title title={`Ingress versions`}/>
          <ServicesSubNav
            registryName={service.registry.name}
            serviceName={service.name}
            canManage={canManage}
            team={team}
        />

        <Row>
          <Col>
            { version.entries.map(entry => (
              <Card key={entry.id} className="mb-2">
                <CardBody>
                  <span><strong>Ingress class:</strong> {entry.ingressClass.name}</span>
                  { entry.rules.map(rule => (
                    <div key={rule.id}>
                      <hr />
                      <div><strong>Path:</strong> {rule.path}</div>
                      { rule.ingressHostKey && rule.ingressHostKey.id ? (
                        <div><strong>Host:</strong> {rule.ingressHostKey.name}</div>
                      ) : null}
                      { rule.customHost ? (
                        <div><strong>Host (custom):</strong> {rule.customHost}</div>
                      ) : null}
                    </div>
                  ))}
                </CardBody>
              </Card>
            ))}
          </Col>
          <Col md="4">
            { canWriteIngress ? (
              <Row className="mb-2">
                <Col>
                  <NewIngressVersionLink
                    registryName={service.registry.name}
                    serviceName={service.name}
                    >
                    <Button color="dark">Create new version</Button>
                  </NewIngressVersionLink>
                </Col>
              </Row>
            ) : null }
            <ListGroup className="mb-2" flush>
              { versions.items.map(version => (
                <IngressVersionsLink
                  registryName={service.registry.name}
                  serviceName={service.name}
                  versionId={version.id}
                  key={version.id}
                >
                  <ListGroupItem
                    className={`p-1 text-truncate ${versionId === version.id ? '' : 'text-dark'}`}
                    active={versionId === version.id}
                  >
                    <p className="mb-1">{version.comment}</p>
                    <small>{version.createdBy.displayName} - <Ago date={version.createdOn} /></small>
                  </ListGroupItem>
                </IngressVersionsLink>
              ))}
            </ListGroup>
            <TablePagination
              pages={versions.pages}
              page={versions.page}
              limit={versions.limit}
              fetchContent={fetchVersionsPagination}
            />
          </Col>
        </Row>
        </Col>
      </Row>
    );
  }
}

export default ServiceIngress;
