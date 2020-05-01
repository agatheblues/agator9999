import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
require('./EmptyList.scss');

const EmptyList = function ({ message, link, linkText }) {
  return (
    <div className='cardgrid-empty'>
      <img alt='no-result' src='../../static/images/noresult.png' />
      <p className='note note--big'>{message}</p>
      {link && <Link to={link}>{linkText}</Link>}
    </div>
  );
};

EmptyList.defaultProps = {
  link: null,
  linkText: null
}

EmptyList.propTypes = {
  message: PropTypes.string.isRequired,
  link: PropTypes.string,
  linkText: PropTypes.string
};

export default EmptyList;
