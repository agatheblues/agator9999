import React from 'react';
import PropTypes from 'prop-types';
require('./ArtistSummary.scss');

// Total tracks reducer
const reducer = (totalTracks, album) => totalTracks + album.totalTracks;

const ArtistSummary = function({artist}) {

  // Get artist total amount of tracks
  let totalTracks = artist.albums.reduce(reducer, 0);

  return (
    <div className='artist-banner-container'>
      <div className='artist-banner-wrapper'>

        <div className='artist-banner-image' style={{ 'backgroundImage': `url(${artist.imgUrl})`}}>
        </div>

        <div className='artist-banner-content-wrapper'>
          <div className='artist-banner-content content-container'>
            <h1>{artist.name}</h1>
            <p>{`${Object.keys(artist.albums).length} albums, ${totalTracks} tracks`}</p>
            <p><a href={artist.url}>{`Listen on ${artist.source}`}</a></p>
          </div>
        </div>

      </div>
    </div>
  );
};

ArtistSummary.propTypes = {
  artist: PropTypes.object.isRequired
};

export default ArtistSummary;
