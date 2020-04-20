import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Row, Col, Nav, NavItem, NavLink } from 'reactstrap';
import {
  JobLink,
  JobVersionLink,
  NewJobVersionLink,
  NamespaceLink,
  NamespacePill,
} from '../Links';
import { Human } from '../DisplayDate';

class JobSubNav extends Component {
  render() {
    const {
      job,
      jobVersion,
      newVersion,
    } = this.props;

    const namespace = (job || jobVersion.job).namespace;

    return (
      <Row className="mb-1">
        <Col>
          <Nav tabs>
            <NavItem>
              <JobLink container job={job}>
                <NavLink><i className="fa fa-cogs" aria-hidden='true'></i> {`${job.name}`}</NavLink>
              </JobLink>
            </NavItem>
            {
              jobVersion ?
              <NavItem className="bread-nav">
                <JobVersionLink container version={jobVersion}>
                  <NavLink><i className="fa fa-file-text" aria-hidden='true'></i> <Human date={jobVersion.createdOn} /></NavLink>
                </JobVersionLink>
              </NavItem>
              : null
            }
            {
              newVersion ?
              <NavItem className="bread-nav">
                <NewJobVersionLink container job={job}>
                  <NavLink>New version</NavLink>
                </NewJobVersionLink>
              </NavItem>
              : null
            }
            { namespace ?
              <NavItem className="ml-auto">
                <NamespaceLink container namespace={namespace}>
                  <NavLink><NamespacePill namespace={namespace} /></NavLink>
                </NamespaceLink>
              </NavItem>
              : null
            }
          </Nav>
        </Col>
      </Row>
    );
  }
}

JobSubNav.propTypes = {
  job: PropTypes.object.isRequired,
};

export default JobSubNav;
