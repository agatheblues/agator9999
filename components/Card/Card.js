import React from 'react';
import PropTypes from 'prop-types';
require('./Card.scss');

const Card = ({name, imgUrl}) => (
  <div className='card-container'>
    <div className='card-wrapper'>
      <img src={imgUrl} className='card-image'/>
      <p>{name}</p>
    </div>
  </div>
);

Card.propTypes = {
  name: PropTypes.string.isRequired,
  imgUrl: PropTypes.string
};

export default Card;
