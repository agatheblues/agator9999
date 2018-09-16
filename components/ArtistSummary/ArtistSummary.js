import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
require('./ArtistSummary.scss');

/**
 * Sums up the total number of tracks over several albums
 * @param  {Integer} totalTracks Initial total tracks
 * @param  {Object} album        Current album
 * @return {Integer}             Sum of tracks per album
 */
const reducer = (totalTracks, album) => totalTracks + album.totalTracks;

/**
 * Renders the listening URI for an artist
 * @param  {Object} artist Artist from FB
 * @return {String}        HTML Markup
 */
const renderListeningUri = function(artist) {
  if (artist.sources.hasOwnProperty('spotify')) {
    const url = 'https://open.spotify.com/artist/' + artist.sources.spotify;
    return (
      <p>
        <a href={url}>&#9836; Open in <span className='capitalize'>Spotify</span>
        </a>
      </p>);
  }

  return <p className='not-available not-available--line'>&#9836;</p>;
};

const ArtistSummary = function({ artist }) {

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
            { renderListeningUri(artist) }
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
