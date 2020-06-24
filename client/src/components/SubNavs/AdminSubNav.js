import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Row, Col, Nav, NavItem, NavLink } from 'reactstrap';
import {
  AdminClustersLink,
  AdminRestoreLink,
  AdminSummaryLink,
  AuditLink,
  EditClusterLink,
  AdminIngressLink,
} from '../Links';

class AdminSubNav extends Component {
  render() {
    const {
      canAudit,
      hasClustersWrite,
      edit,
      cluster,
      hasIngressAdminWrite,
    } = this.props;


    return (
      <Row className="mb-1">
        <Col>
          <Nav tabs>
            <NavItem>
              <AdminSummaryLink container>
                <NavLink>Summary</NavLink>
              </AdminSummaryLink>
            </NavItem>
            {
              canAudit ?
              <NavItem>
                <AuditLink container>
                  <NavLink><i className="fa fa-user-secret" aria-hidden='true'></i> Audit</NavLink>
                </AuditLink>
              </NavItem>
              : null
            }
            <NavItem>
              <AdminRestoreLink container>
                <NavLink><i className="fa fa-undo" aria-hidden='true'></i> Restore</NavLink>
              </AdminRestoreLink>
            </NavItem>
            {
              hasClustersWrite ?
              <NavItem>
                <AdminClustersLink container>
                  <NavLink><i className="fa fa-server" aria-hidden='true'></i> Clusters</NavLink>
                </AdminClustersLink>
              </NavItem>
              : null
            }
            {
              edit && cluster ?
              <NavItem className="bread-nav">
                <EditClusterLink container cluster={cluster}>
                  <NavLink><i className="fa fa-server" aria-hidden='true'></i> Edit {cluster.name}</NavLink>
                </EditClusterLink>
              </NavItem>
              : null
            }
            {
              hasIngressAdminWrite ?
              <NavItem>
                <AdminIngressLink container>
                  <NavLink><i className="fa fa-sign-in" aria-hidden='true'></i> Ingress</NavLink>
                </AdminIngressLink>
              </NavItem>
              : null
            }
          </Nav>
        </Col>
      </Row>
    );
  }
}

AdminSubNav.propTypes = {
  canAudit: PropTypes.bool,
};

export default AdminSubNav;
