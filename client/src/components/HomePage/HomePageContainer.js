import { connect } from 'react-redux';
import HomePage from './HomePage';

export default connect(({ home }) => ({
  releases: home.releases.data.items,
  deployments: home.deployments.data.items,
}))(HomePage);
