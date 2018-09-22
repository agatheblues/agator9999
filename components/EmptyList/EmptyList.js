import React from 'react';
import PropTypes from 'prop-types';
require('./EmptyList.scss');

const EmptyList = function({message}) {

  return (
    <div className='cardgrid-empty'>
      <img alt='no-result' src='../../static/images/noresult.png' />
      <p className='note note--big'>{message}</p>
    </div>
  );
};

EmptyList.propTypes = {
  message: PropTypes.string.isRequired
};

export default EmptyList;
