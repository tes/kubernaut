import { connect } from 'react-redux';
import { withRouter } from 'react-router';
import Navigation from './Navigation';


export default connect((state) => ({
  account: state.account,
}),{})(withRouter(Navigation));
