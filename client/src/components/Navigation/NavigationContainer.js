import { connect } from 'react-redux';
import { withRouter } from 'react-router';
import Navigation from './Navigation';


export default withRouter(connect((state) => ({
  account: state.account,
}),{})(Navigation));
