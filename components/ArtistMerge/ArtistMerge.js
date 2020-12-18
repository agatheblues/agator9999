import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { ArtistMergeContext } from '../../context/ArtistMergeContext';
import Button from '../Button/Button';
import Message from '../Message/Message';
import ArtistCard from '../ArtistCard/ArtistCard';
import SearchDropdown from '../SearchDropdown/SearchDropdown';
require('./ArtistMerge.scss');

class ArtistMerge extends React.Component {
  constructor() {
    super();

    this.state = {
      artistToMergeWith: null,
      mergeableArtists: [],
      error: false,
      message: null,
      showForm: false
    };

    this.handleSelectedArtist = this.handleSelectedArtist.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  /**
   * Filters the list of artists to return only those which are mergeable.
   * Mergeable means that the artist has not the same source as the originArtist
   * @param {String} spotify_id 
   * @param {String} discogs_id 
   * @param {Array} artists 
   */
  getMergeableArtists(spotify_id, discogs_id, artists) {
    if (spotify_id && !discogs_id) {
      return artists.filter(a => a.discogs_id && !a.spotify_id);
    }
    return artists.filter(a => a.spotify_id && !a.discogs_id);
  }

  handleSubmit(e) {
    e.preventDefault();
    this.props.mergeArtists(this.props.originArtist, this.state.artistToMergeWith);
  }

  handleSelectedArtist(artistId) {
    this.setState({
      artistToMergeWith: this.props.artists.find((artist) => artist.id == artistId)
    });
  }

  handleMergeableArtists(mergeableArtists) {
    if (mergeableArtists.length === 0) {
      this.setState({
        message: 'There are no artists from a different source to merge with!'
      });
    } else {
      this.setState({
        mergeableArtists: mergeableArtists,
        showForm: true
      });
    }
  }

  renderCards(originArtist, artistToMergeWith) {
    const cardClass = classNames({
      'form-row-container form-row--center': true,
      'form-row--space-between': artistToMergeWith,
      'form-row--space-around': !artistToMergeWith
    });

    const { img_url, name, id, total_albums, spotify_id, discogs_id } = originArtist;

    return (
      <div className={cardClass}>
        <ArtistCard
          id={id}
          name={name}
          imgUrl={img_url}
          totalAlbums={total_albums}
          sources={{ spotify: spotify_id, discogs: discogs_id }}
        />
        {artistToMergeWith &&
          <p className='merge-plus'>+</p>
        }
        {artistToMergeWith &&
          <ArtistCard
            id={artistToMergeWith.id}
            name={artistToMergeWith.name}
            imgUrl={artistToMergeWith.img_url}
            totalAlbums={artistToMergeWith.total_albums}
            sources={{ spotify: artistToMergeWith.spotify_id, discogs: artistToMergeWith.discogs_id }}
          />
        }
      </div>
    );
  }

  renderForm(artists, message, error) {
    return (
      <div>
        <SearchDropdown
          list={artists}
          id={'id'}
          value={'name'}
          placeholder={'Find an artist to merge with'}
          handleValue={this.handleSelectedArtist}
        />

        {message &&
          <Message message={message} error={error} />
        }

        <div className='submit-container'>
          <Button label='OK' handleClick={this.handleSubmit} />
        </div>
      </div>
    );
  }

  componentDidMount() {
    const { spotify_id, discogs_id } = this.props.originArtist;
    if (spotify_id && discogs_id) {
      this.setState({
        message: 'This artist has already been merged!'
      });
      return;
    }
    const mergeableArtists = this.getMergeableArtists(spotify_id, discogs_id, this.props.artists);
    this.handleMergeableArtists(mergeableArtists);
  }

  componentWillUpdate(nextProps, _nextState) {
    const { originArtist: artist } = this.props;
    const { originArtist: nextArtist } = nextProps;

    if ((artist.spotify_id && artist.discogs_id != nextArtist.discogs_id) || (artist.discogs_id && artist.spotify_id != nextArtist.spotify_id)) {
      this.setState({
        error: false,
        message: 'Merge was successful!',
        showForm: false,
        artistToMergeWith: null
      });
    }
  }

  render() {
    const { showForm, artistToMergeWith, message, error, mergeableArtists } = this.state;

    return (
      <div className='form-container'>
        <form onSubmit={this.handleSubmit}>
          {this.renderCards(this.props.originArtist, artistToMergeWith)}
          {showForm && this.renderForm(mergeableArtists, message, error)}
          {!showForm && message && <Message message={message} error={error} />}
          <p className='note'>You can only merge two artists with different sources. Merging two artists creates one artist with both sources combined, and all the albums will be stored under one artist.</p>
        </form>
      </div>
    );
  }
}

ArtistMerge.propTypes = {
  artists: PropTypes.array.isRequired,
  originArtist: PropTypes.object.isRequired,
  mergeArtists: PropTypes.func.isRequired
};

const ArtistMergeConsumer = (props) => {
  return (
    <ArtistMergeContext.Consumer>
      {({ mergeArtists }) => <ArtistMerge {...props} {...{ mergeArtists }} />}
    </ArtistMergeContext.Consumer>
  );
}

export default ArtistMergeConsumer;