import React, { Component, } from 'react';
import PropTypes from 'prop-types';
import { Human, Ago, } from '../DisplayDate';
import { AccountLink, RegistryLink, ServiceLink, ReleaseLink, ClusterLink, NamespaceLink, } from '../Links';
import './DeploymentDetailsPage.css';

class DeploymentDetailsPage extends Component {

  componentDidMount() {
    this.props.fetchDeployment();
  }

  render() {
    const { meta = {}, deployment, } = this.props;

    const errorDetails = () =>
      <div>Error loading deployments</div>
    ;

    const loadingDetails = () =>
      <div>Loading deployments</div>
    ;

    const deploymentDetails = () =>
      <div className='details'>
        <div className='row'>
          <div className='col-md-2'>
            <span className='details__label'>Service:</span>
          </div>
          <div className='col-md-10'>
            <span><ServiceLink service={deployment.release.service} /></span>
          </div>
        </div>
        <div className='row'>
          <div className='col-md-2'>
            <span className='details__label'>Version:</span>
          </div>
          <div className='col-md-10'>
            <span><ReleaseLink release={deployment.release} /></span>
          </div>
        </div>
        <div className='row'>
          <div className='col-md-2'>
            <span className='details__label'>Registry:</span>
          </div>
          <div className='col-md-10'>
            <span><RegistryLink registry={deployment.release.service.registry} /></span>
          </div>
        </div>
        <div className='row'>
          <div className='col-md-2'>
            <span className='details__label'>Cluster:</span>
          </div>
          <div className='col-md-10'>
            <span><ClusterLink cluster={deployment.namespace.cluster} /></span>
          </div>
        </div>
        <div className='row'>
          <div className='col-md-2'>
            <span className='details__label'>Namespace:</span>
          </div>
          <div className='col-md-10'>
            <span><NamespaceLink namespace={deployment.namespace} /></span>
          </div>
        </div>
        <div className='row'>
          <div className='col-md-2'>
            <span className='details__label'>Apply Exit Code:</span>
          </div>
          <div className='col-md-10'>
            <span>{deployment.applyExitCode}</span>
          </div>
        </div>
        <div className='row'>
          <div className='col-md-2'>
            <span className='details__label'>Rollout Status Exit Code:</span>
          </div>
          <div className='col-md-10'>
            <span>{deployment.rolloutStatusExitCode}</span>
          </div>
        </div>
        <div className='row'>
          <div className='col-md-2'>
            <span className='details__label'>Created On:</span>
          </div>
          <div className='col-md-10'>
            <span><Human date={deployment.createdOn} /></span>&nbsp;
            <span>(<Ago date={deployment.createdOn} />)</span>
          </div>
        </div>
        <div className='row'>
          <div className='col-md-2'>
            <span className='details__label'>Created By:</span>
          </div>
          <div className='col-md-10'>
            <span><AccountLink account={deployment.createdBy} /></span>
          </div>
        </div>
        <div className='row'>
          <div className='col-md-12'>
            <h2>Deployment Log</h2>
          </div>
        </div>
        <div className='row'>
          <div className='col-md-12'>
            <table className='log-table table table-condensed '>
              <tbody>
              {
                deployment.log.map(entry => {
                  return <tr key={entry.id} className={`log-table__body log-table__body__row--${entry.writtenTo}`}>
                    <td className='log-table__body__row__written-on'><Human date={entry.writtenOn} /></td>
                    <td className='log-table__body__row__content'>{entry.content}</td>
                  </tr>;
                })
              }
              </tbody>
            </table>
          </div>
        </div>
        <div className='row'>
          <div className='col-md-12'>
            <h2>Kubernetes Manifest</h2>
          </div>
          <div className='col-md-12'>
            <pre>{deployment.manifest.yaml}</pre>
          </div>
        </div>
      </div>
    ;

    return (
      <div>
        <h2>Deployment Details</h2>
        {
          (() => {
            if (meta.error) return errorDetails();
            else if (meta.loading || !deployment) return loadingDetails();
            else return deploymentDetails();
          })()
        }
      </div>
    );
  }
}

DeploymentDetailsPage.propTypes = {
  deployment: PropTypes.object,
};

export default DeploymentDetailsPage;
