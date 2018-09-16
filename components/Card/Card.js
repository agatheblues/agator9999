import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
require('./Card.scss');

const Card = function({id, name, imgUrl, totalAlbums, source}) {
  let albums;
  if (totalAlbums) {
    albums = (totalAlbums > 1) ? totalAlbums + ' albums' : totalAlbums + ' album';
  }

  return (
    <div className='card-container'>
      <Link to={'/artist/' + id} className='card-link'>
        <div className='card-wrapper'>
          <div className='card-image' style={{ 'backgroundImage': `url('${imgUrl}'), url('/static/images/loading-artist.png')`}}>
          </div>
          <div className='card-details'>
            <p>{name}</p>
            {albums &&
              <p>{albums}</p>
            }
            {source &&
              <p>Source: <span className='capitalize'>{source}</span></p>
            }
          </div>
        </div>
      </Link>
    </div>
  );
};

Card.propTypes = {
  id: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  totalAlbums: PropTypes.number,
  imgUrl: PropTypes.string,
  source: PropTypes.string
};

export default Card;
