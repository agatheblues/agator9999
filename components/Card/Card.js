import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
require('./Card.scss');

const Card = function ({ id, name, imgUrl, totalAlbums, sources }) {
  const albums = (totalAlbums > 1) ? totalAlbums + ' albums' : totalAlbums + ' album';
  const sourceString = sources ? Object.keys(sources)
    .filter(key => sources[key])
    .join(', ') : null;
  const src = imgUrl ? imgUrl : '/static/images/missing.jpg';

  return (
    <div className='card-container'>
      <Link to={'/artist/' + id} className='card-link'>
        <div className='card-wrapper'>
          <div className='card-image' style={{ 'backgroundImage': `url('${src}'), url('/static/images/loading-artist.png')` }}>
          </div>
          <div className='card-details'>
            <p>{name}</p>
            {albums &&
              <p>{albums}</p>
            }
            {sourceString &&
              <p className='capitalize'>{sourceString}</p>
            }
          </div>
        </div>
      </Link>
    </div>
  );
};

Card.propTypes = {
  id: PropTypes.number.isRequired,
  name: PropTypes.string.isRequired,
  totalAlbums: PropTypes.number,
  imgUrl: PropTypes.string,
  sources: PropTypes.object
};

export default Card;
