import React from 'react';
import PropTypes from 'prop-types';

const Card = ({name, imgUrl}) => (
  <div>
    <img src={imgUrl}/>
    <p>{name}</p>
  </div>
);

Card.propTypes = {
  name: PropTypes.string.isRequired,
  imgUrl: PropTypes.string.isRequired
};

export default Card;
