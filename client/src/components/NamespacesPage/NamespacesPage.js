import React, { Component, } from 'react';
import PropTypes from 'prop-types';

import NamespacesTable from '../NamespacesTable';

class NamespacesPage extends Component {

  componentDidMount() {
    this.props.fetchNamespaces();
  }

  render() {
    const { error, loading, namespaces, fetchNamespaces, } = this.props;

    return (
      <div className='row'>
        <div className='col-12'>
          <NamespacesTable namespaces={namespaces.data} loading={loading} error={error} fetchNamespaces={fetchNamespaces} />
        </div>
      </div>
    );
  }
}

NamespacesPage.propTypes = {
  namespaces: PropTypes.object,
};

export default NamespacesPage;
