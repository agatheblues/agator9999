import React from 'react';
import classNames from 'classnames';
import { ArtistContext } from '../../context/ArtistContext';
import { UserContext } from '../../context/UserContext';
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
    const url = 'https://open.spotify.com/go?uri=spotify:artist:' + spotify_id;
    return (
      <p>
        <a
          href={url}
          target='_blank'
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

const ArtistSummary = (artist, admin, showArtistDeleted) => {
  const { id, img_url, total_albums, total_tracks, name, discogs_id, spotify_id } = artist;
  const artistBannerWrapper = classNames({
    'artist-banner-wrapper': true,
    'artist-banner-wrapper--deleted': showArtistDeleted
  });

  const artistBannerContentWrapper = classNames({
    'artist-banner-content-wrapper': true,
    'artist-banner-content-wrapper--deleted': showArtistDeleted
  });

  return (
    <div className='artist-banner-container' style={{ 'backgroundImage': `url('${img_url}')` }}>
      <div className={artistBannerWrapper}>
        <div className='artist-banner-back-wrapper'>
          <div className='artist-banner-back content-container'>
            <Link to='/'>&#9839; Back to library</Link>
            {admin && !showArtistDeleted && renderMergeButton(discogs_id, spotify_id, id)}
          </div>
        </div>

        <div className={artistBannerContentWrapper}>
          <div className='artist-banner-content content-container'>
            <h1>{name}</h1>
            <p>{`${total_albums} albums, ${total_tracks} tracks`}</p>
            {!showArtistDeleted && renderListeningUri(spotify_id)}
          </div>
        </div>
      </div>
    </div>
  );
}

ArtistSummary.propTypes = {
  artist: PropTypes.object.isRequired,
  admin: PropTypes.bool.isRequired,
  showArtistDeleted: PropTypes.bool.isRequired
};

const ArtistSummaryConsumer = ({ showArtistDeleted }) => {
  return (
    <UserContext.Consumer>
      {({ admin }) =>
        <ArtistContext.Consumer>
          {({ artist }) => ArtistSummary(artist, admin, showArtistDeleted)}
        </ArtistContext.Consumer>
      }
    </UserContext.Consumer>
  );
};

export default ArtistSummaryConsumer;
