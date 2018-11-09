import React from 'react';
import PropTypes from 'prop-types';
import Helmet from 'react-helmet';

/*
  Until Helmet gets released for the first time in a year with the merged PR,
  this issue will continue: https://github.com/nfl/react-helmet/issues/408

  So... we've got to wrap something supposed to provide this functionality. Sigh.
*/

const Title = ({ title }) => (
  <Helmet defaultTitle="Kubernaut">
    { title ? <title>{`${title} | Kubernaut`}</title> : null }
  </Helmet>
);

Title.propTypes = {
  title: PropTypes.string,
};

export default Title;
