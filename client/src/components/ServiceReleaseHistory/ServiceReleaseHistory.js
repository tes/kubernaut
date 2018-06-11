import React, { Component } from 'react';
import PropTypes from 'prop-types';

class ServiceReleaseHistory extends Component {

  render() {
    const releases = this.props.releases;
    const rows = [];
    if (releases && releases.data && releases.data.items) {
      releases.data.items.forEach(item => {
        rows.push((
          <div className="row" key={item.id}>
            <div className="col-md-2">{item.createdOn}</div>
            <div className="col-md-2">{item.version}</div>
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
