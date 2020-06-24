import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
  Row,
  Col,
  Progress,
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Badge,
} from 'reactstrap';
import TablePagination from '../TablePagination';
import {
  AccountLink,
  ClusterLink,
  DeploymentLink,
  NamespaceLink,
  RegistryLink,
  ReleaseLink,
  SecretVersionLink,
  ServiceLink,
  TeamLink,
  JobLink,
  JobVersionLink,
} from '../Links';
import { CreateQuickFilters } from '../TableFilter';
import { Ago } from '../DisplayDate';
import { AdminSubNav } from '../SubNavs';
import Title from '../Title';

const filterDisplayNameLookup = {
  sourceAccount: 'Source account',
  account: 'Account',
  cluster: 'Cluster',
  deployment: 'Deployment',
  namespace: 'Namespace',
  registry: 'Registry',
  release: 'Release',
  secret: 'Secret',
  service: 'Service',
  team: 'Team',
  job: 'Cronjob',
  jobVersion: 'Cronjob version',
};
class AuditPage extends Component {

  render() {
    const { meta, audits, canAudit, hasClustersWrite, hasIngressAdminWrite } = this.props;
    if (meta.loading.loadingPercent !== 100) return (
      <Row className="page-frame d-flex justify-content-center">
        <Col sm="12" className="mt-5">
          <Progress animated color="info" value={meta.loading.loadingPercent} />
        </Col>
      </Row>
    );

    if (meta.error && meta.error === 'Forbidden') {
      return (
        <Row className="page-frame">
          <Col xs="12">
            <p>You are not authorised to view this page.</p>
          </Col>
        </Row>
      );
    }

    const { QuickFilters } = CreateQuickFilters(this.props.addFilter);

    return (
      <Row className="page-frame">
        <Col>
          <Title title="Audit" />
          <AdminSubNav canAudit={canAudit} hasClustersWrite={hasClustersWrite} hasIngressAdminWrite={hasIngressAdminWrite} />
          <Row>
            <Col className="d-flex justify-content-start flex-wrap">
              {this.props.filters.map((filter) => {
                const displayName = filterDisplayNameLookup[filter.key];
                const filterValue = filter.displayValue || filter.value;
                const closeEl = <i
                    onClick={() => this.props.removeFilter(filter.uuid)}
                    className='fa fa-times clickable'
                    aria-hidden='true'
                  ></i>;

                return (
                  <div key={filter.uuid}>
                    <Badge color={filter.not ? 'danger' : 'success'} className="mr-2">
                      <span>{displayName} : {filterValue.toString()} {closeEl}</span>
                    </Badge>
                  </div>
                );
              })}
            </Col>
          </Row>
          <Row>
            <Col>
              { audits.items.map(audit => {
                return (
                  <Row key={audit.id}>
                    <Col>
                      <Card className="m-1">
                        <CardHeader className="d-flex justify-content-between px-2 py-1">
                          <div className="cellFilterActionsParent">
                            <AccountLink account={audit.sourceAccount} />
                            <QuickFilters value={audit.sourceAccount.id} column='sourceAccount' displayValue={audit.sourceAccount.displayName} />
                          </div>
                          <div><Ago date={audit.createdOn} /></div>
                        </CardHeader>
                        <CardBody className="px-2 py-1">
                          {audit.action}
                        </CardBody>
                        <CardFooter className="d-flex justify-content-start flex-wrap px-2 py-1">
                          {
                            audit.account ? <div className="mr-1 cellFilterActionsParent">
                              Account: <AccountLink account={audit.account} />
                            <QuickFilters value={audit.account.id} column='account' displayValue={audit.account.displayName} />
                            </div> : null
                          }
                          {
                            audit.cluster ? <div className="mr-1 cellFilterActionsParent">
                              Cluster: <ClusterLink cluster={audit.cluster} />
                            <QuickFilters value={audit.cluster.id} column='cluster' displayValue={audit.cluster.name} />
                            </div> : null
                          }
                          {
                            audit.deployment ? <div className="mr-1 cellFilterActionsParent">
                              Deployment: <DeploymentLink deployment={audit.deployment}>View</DeploymentLink>
                              <QuickFilters value={audit.deployment.id} column='deployment' />
                            </div> : null
                          }
                          {
                            audit.namespace ? <div className="mr-1 cellFilterActionsParent">
                              Namespace: <NamespaceLink namespace={audit.namespace} pill showCluster />
                              <QuickFilters
                                value={audit.namespace.id}
                                column='namespace'
                                displayValue={`${audit.namespace.cluster.name}/${audit.namespace.name}`}
                              />
                            </div> : null
                          }
                          {
                            audit.registry ? <div className="mr-1 cellFilterActionsParent">
                              Registry: <RegistryLink registry={audit.registry} />
                            <QuickFilters value={audit.registry.id} column='registry' displayValue={audit.registry.name} />
                            </div> : null
                          }
                          {
                            audit.release ? <div className="mr-1 cellFilterActionsParent">
                              Release: <ReleaseLink release={audit.release} />
                            <QuickFilters value={audit.release.id} column='release' displayValue={audit.release.version} />
                            </div> : null
                          }
                          {
                            audit.secretVersion ? <div className="mr-1 cellFilterActionsParent">
                              Secret version: <SecretVersionLink secretVersion={audit.secretVersion} />
                              <QuickFilters value={audit.secretVersion.id} column='secret' />
                            </div> : null
                          }
                          {
                            audit.service ? <div className="mr-1 cellFilterActionsParent">
                              Service: <ServiceLink service={audit.service} />
                            <QuickFilters value={audit.service.id} column='service' displayValue={audit.service.name} />
                            </div> : null
                          }
                          {
                            audit.team ? <div className="mr-1 cellFilterActionsParent">
                              Team: <TeamLink team={audit.team} />
                            <QuickFilters value={audit.team.id} column='team' displayValue={audit.team.name} />
                            </div> : null
                          }
                          {
                            audit.job ? <div className="mr-1 cellFilterActionsParent">
                              CronJob: <JobLink job={audit.job} />
                            <QuickFilters value={audit.job.id} column='job' displayValue={audit.job.name} />
                            </div> : null
                          }
                          {
                            audit.jobVersion ? <div className="mr-1 cellFilterActionsParent">
                              Cronjob version: <JobVersionLink version={audit.jobVersion} />
                            <QuickFilters value={audit.jobVersion.id} column='jobVersion' displayValue={audit.jobVersion.createdOn} />
                            </div> : null
                          }
                        </CardFooter>
                      </Card>
                    </Col>
                  </Row>
                );
              })}
            </Col>
          </Row>
          <Row>
            <Col>
              <TablePagination
                pages={audits.pages}
                page={audits.page}
                limit={audits.limit}
                fetchContent={this.props.fetchAuditPagination}
              />
            </Col>
          </Row>
        </Col>
      </Row>
    );
  }
}

AuditPage.propTypes = {
  services: PropTypes.object,
};

export default AuditPage;
