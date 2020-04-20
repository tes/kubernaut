import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Row, Col, Progress, Button } from 'reactstrap';
import Title from '../Title';
import { JobSubNav } from '../SubNavs';
import { AccountLink } from '../Links';

class Version extends Component {

  render() {
    const jobVersion = this.props.jobVersion.data;
    const { meta } = this.props;

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
          <Title title={`Job Version: ${jobVersion.job.name}`}/>
          <JobSubNav job={jobVersion.job} jobVersion={jobVersion} />
          <Row>
            <Col md="8">
              <Row>
                <Col>
                  <pre className="bg-light p-2">
                    <code>
                      {jobVersion.yaml}
                    </code>
                  </pre>
                </Col>
              </Row>
            </Col>
            <Col>
              <Row>
                <Col>
                  <Button
                    className="pull-right"
                    color="dark"
                    onClick={() => this.props.apply()}
                  >Apply</Button>
                </Col>
              </Row>
              <Row>
                <Col>
                  <span>Created by: <AccountLink account={jobVersion.createdBy} /></span>
                </Col>
              </Row>
            </Col>
          </Row>
        </Col>
      </Row>
    );
  }
}

Version.propTypes = {
  jobVersion: PropTypes.object.isRequired,
};

export default Version;
