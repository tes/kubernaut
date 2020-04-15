import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Row, Col, Nav, NavItem, NavLink } from 'reactstrap';
import {
  JobLink,
  JobVersionLink,
} from '../Links';
import { Human } from '../DisplayDate';

class JobSubNav extends Component {
  render() {
    const {
      job,
      jobVersion,
    } = this.props;

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
