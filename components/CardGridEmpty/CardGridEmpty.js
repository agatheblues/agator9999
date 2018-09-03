import React from 'react';
import PropTypes from 'prop-types';
require('./CardGridEmpty.scss');

const CardGridEmpty = function({message}) {

  return (
    <div className='cardgrid-empty'>
      <img alt='no-result' src='../../static/images/noresult.png' />
      <p className='note note--big'>{message}</p>
    </div>
  );
};

CardGridEmpty.propTypes = {
  message: PropTypes.string.isRequired
};

export default CardGridEmpty;
