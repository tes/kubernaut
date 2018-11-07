import React, { Component } from 'react';
import PropTypes from 'prop-types';

import NamespacesTable from '../NamespacesTable';

class NamespacesPage extends Component {

  render() {
    const { namespaces, fetchNamespacesPagination } = this.props;

    return (
      <div className='row'>
        <div className='col-sm'>
          <NamespacesTable namespaces={namespaces.data} loading={namespaces.meta.loading} error={namespaces.meta.error} fetchNamespaces={fetchNamespacesPagination} />
        </div>
      </div>
    );
  }
}

NamespacesPage.propTypes = {
  namespaces: PropTypes.object,
};

export default NamespacesPage;
