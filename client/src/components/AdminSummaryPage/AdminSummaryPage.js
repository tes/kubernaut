import React, { Component } from 'react';
import {
  Row,
  Col,
} from 'reactstrap';
// import {
//
// } from '../Links';
import { AdminSubNav } from '../SubNavs';

class AdminSummaryPage extends Component {

  render() {
    const { canAudit } = this.props;

    return (
      <Row className='page-frame'>
        <Col md className="mb-2">
          <AdminSubNav canAudit={canAudit} />
        </Col>
      </Row>
    );
  }
}

export default AdminSummaryPage;
