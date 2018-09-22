import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
require('./Card.scss');


function sourcesReducer(accumulator, currentValue, currentIndex, array) {
  if (currentIndex == array.length - 1) {
    return accumulator + ' ' + currentValue;
  }

  return accumulator + ' ' + currentValue + ',';
}

const Card = function({id, name, imgUrl, totalAlbums, sources}) {
  let albums = (totalAlbums > 1) ? totalAlbums + ' albums' : totalAlbums + ' album';

  let sourceString;
  if (sources) {
    sourceString = Object.keys(sources).reduce(sourcesReducer, 'Sources: ');
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
            {sources &&
              <p>{sourceString}</p>
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
  sources: PropTypes.object
};

export default Card;
