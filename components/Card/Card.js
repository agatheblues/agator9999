import React from 'react';
import PropTypes from 'prop-types';
require('./Card.scss');

const Card = ({name, imgUrl}) => (
  <div className='card-container'>
    <img src={imgUrl}/>
    <p>{name}</p>
  </div>
);

Card.propTypes = {
  name: PropTypes.string.isRequired,
  imgUrl: PropTypes.string
};

export default Card;
