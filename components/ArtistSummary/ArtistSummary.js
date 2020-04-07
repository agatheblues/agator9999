import React from 'react';
import { ArtistContext } from '../../context/ArtistContext';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
require('./ArtistSummary.scss');


/**
 * Renders the listening URI for an artist
 * @param  {String} spotify_id Artist's spotify_id
 * @return {String}            HTML Markup
 */
const renderListeningUri = (spotify_id) => {
  if (spotify_id) {
    const url = 'spotify:artist:' + spotify_id;
    return (
      <p>
        <a
          href={url}
          rel='noopener noreferrer'
        >&#9836; Open in <span className='capitalize'>Spotify</span>
        </a>
      </p>
    );
  }

  return <p className='not-available not-available--line'>&#9836;</p>;
};

const renderMergeButton = (spotify_id, discogs_id, id) => {
  if (spotify_id && discogs_id) {
    return <Link to={`/artist/${id}/unmerge`}>&#x2702; Unmerge</Link>;
  }

  return (
    <Link to={`/artist/${id}/merge`}>&#x260A; Merge</Link>
  );
};

const ArtistSummary = (artist, isAdmin) => {
  const { id, img_url, total_albums, total_tracks, name, discogs_id, spotify_id } = artist;

  return (
    <div className='artist-banner-container' style={{ 'backgroundImage': `url('${img_url}')` }}>
      <div className='artist-banner-wrapper'>
        <div className='artist-banner-back-wrapper'>
          <div className='artist-banner-back content-container'>
            <Link to='/'>&#9839; Back to library</Link>
            {isAdmin && renderMergeButton(discogs_id, spotify_id, id)}
          </div>
        </div>

        <div className='artist-banner-content-wrapper'>
          <div className='artist-banner-content content-container'>
            <h1>{name}</h1>
            <p>{`${total_albums} albums, ${total_tracks} tracks`}</p>
            {renderListeningUri(spotify_id)}
          </div>
        </div>
      </div>
    </div>
  );
}

ArtistSummary.propTypes = {
  artist: PropTypes.object.isRequired,
  isAdmin: PropTypes.bool.isRequired
};

const ArtistSummaryConsumer = (props) => {
  return (
    <ArtistContext.Consumer>
      {({ artist }) => ArtistSummary(artist, props.isAdmin)}
    </ArtistContext.Consumer>
  );
};

export default ArtistSummaryConsumer;
