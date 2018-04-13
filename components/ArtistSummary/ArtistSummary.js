import React from 'react';
import PropTypes from 'prop-types';
require('./ArtistSummary.scss');

// Total tracks reducer
const reducer = (totalTracks, album) => totalTracks + album.totalTracks;

const ArtistSummary = function({artist}) {

  // Get artist total amount of tracks
  let totalTracks = artist.albums.reduce(reducer, 0);

  return (
    <div className='card-container'>
      <div className='card-wrapper'>
        <img src={artist.imgUrl} className='card-image'/>
        <p>{artist.name}</p>
        <p>{artist.source}</p>
        <p>{Object.keys(artist.albums).length} albums</p>
        <p>{totalTracks}</p>
      </div>
    </div>
  );
};

ArtistSummary.propTypes = {
  artist: PropTypes.object.isRequired
};

export default ArtistSummary;
