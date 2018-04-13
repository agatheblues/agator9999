import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
require('./Card.scss');

const Card = ({id, name, imgUrl}) => (
  <div className='card-container'>
    <Link to={'/artist/' + id}>
      <div className='card-wrapper'>
        <img src={imgUrl} className='card-image'/>
        <p>{name}</p>
      </div>
    </Link>
  </div>
);

Card.propTypes = {
  id: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  imgUrl: PropTypes.string
};

export default Card;
