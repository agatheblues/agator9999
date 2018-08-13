import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
require('./ArtistSummary.scss');

// Total tracks reducer
const reducer = (totalTracks, album) => totalTracks + album.totalTracks;

const ArtistSummary = function({artist}) {

  // Get artist total amount of tracks
  let totalTracks = artist.albums.reduce(reducer, 0);

  return (
    <div className='artist-banner-container'>
      <div className='artist-banner-wrapper'>

        <div className='artist-banner-image' style={{ 'backgroundImage': `url('${artist.imgUrl}')`}}>
          <div className='artist-banner-image--overlay'/>
        </div>

        <div className='artist-banner-back-wrapper'>
          <div className='artist-banner-back content-container'>
            <Link to='/'>&#9839; Back to library</Link>
          </div>
        </div>

        <div className='artist-banner-content-wrapper'>
          <div className='artist-banner-content content-container'>
            <h1>{artist.name}</h1>
            <p>{`${Object.keys(artist.albums).length} albums, ${totalTracks} tracks`}</p>
            {getListeningUri(artist)}
          </div>
        </div>

      </div>
    </div>
  );
};

function getListeningUri(artist) {
  if (artist.source && artist.url) {
    return <p><a href={artist.url}>&#9836; {`Listen on ${artist.source}`}</a></p>;
  }

  return <p>&#9836; No listening URL</p>;
}

ArtistSummary.propTypes = {
  artist: PropTypes.object.isRequired
};

export default ArtistSummary;
