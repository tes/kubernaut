import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Card, CardBody } from 'reactstrap';
import { CreateDeploymentLink } from '../Links';

class ServiceReleaseHistory extends Component {

  render() {
    const releases = this.props.releases;
    const rows = [];
    if (releases && releases.data && releases.data.items) {
      releases.data.items.forEach(item => {
        rows.push((
          <div className="row" key={item.id}>
            <Card className="col-lg-9">
              <CardBody className="row p-1">
                <div className="col-lg">
                  <dl className="row mb-0">
                    <dt className="col-lg-3">When:</dt>
                    <dd className="col-lg-9">{item.createdOn}</dd>
                    <dt className="col-lg-3">Version:</dt>
                    <dd className="col-lg-9">{item.version}</dd>
                  </dl>
                </div>
                <div className="col-lg">
                  <dl className="row mb-0">
                    <dt className="col-lg-3">Actions:</dt>
                    <dd className="col-lg-9">
                      <CreateDeploymentLink
                        service={item.service}
                        registry={item.service.registry}
                        version={item.version}
                      />
                    </dd>
                  </dl>
                </div>
              </CardBody>
            </Card>
          </div>
        ));
      });
    }
    return (
      <div>
        {rows}
      </div>
    );
  }
}

ServiceReleaseHistory.propTypes = {
  releases: PropTypes.object,
};

export default ServiceReleaseHistory;
