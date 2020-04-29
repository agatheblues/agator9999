import React from 'react';
import PropTypes from 'prop-types';
import { ArtistUnmergeContext } from '../../context/ArtistUnmergeContext';
import Button from '../Button/Button';
import Message from '../Message/Message';
import Card from '../Card/Card';
require('./ArtistUnmerge.scss');

class ArtistUnmerge extends React.Component {

  constructor() {
    super();

    this.state = {
      error: false,
      message: null,
      showForm: false,
      spotify_id: null,
      discogs_id: null
    };

    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleDeleteClick = this.handleDeleteClick.bind(this);
    this.resetDeleteSources = this.resetDeleteSources.bind(this);
  }

  handleDeleteClick(event) {
    event.preventDefault();
    this.setState({
      error: false,
      message: null,
      [event.target.id]: null
    });
  }

  resetDeleteSources(event) {
    event.preventDefault();
    this.setState({
      error: false,
      message: null,
      spotify_id: this.props.artist.spotify_id,
      discogs_id: this.props.artist.discogs_id
    });
  }

  handleSubmit(e) {
    e.preventDefault();
    const { spotify_id, discogs_id } = this.state;

    if (spotify_id && discogs_id) {
      this.setState({
        error: true,
        message: 'Please delete a source first!'
      });
      return;
    }

    const data = spotify_id ? { discogs_id } : { spotify_id };
    this.props.updateArtist(this.props.artist, data);
  }

  renderCard(artist) {
    const { img_url, name, id, total_albums } = artist;

    return (
      <Card
        id={id}
        name={name}
        imgUrl={img_url}
        totalAlbums={total_albums}
      />
    );
  }

  renderSourceItem(id, url, source, deletable) {
    return (
      <li key={source} className='sources-list-item'>
        <div>
          <span className='capitalize'>{source}: </span>
          <a href={url} target='_blank' rel='noopener noreferrer'>{id}</a>
        </div>
        {deletable &&
          <a href='' className='unmerge-button' id={`${source}_id`} onClick={this.handleDeleteClick}>{'\u{2A2F}'}</a>
        }
      </li>
    );
  }

  renderSources(spotify_id, discogs_id) {
    return (
      <div className='sources-container'>
        <h3>Artist sources:</h3>
        <ul className='vertical-list'>
          {spotify_id && discogs_id &&
            this.renderSourceItem(spotify_id, 'spotify:artist:', 'spotify', true)
          }
          {spotify_id && discogs_id &&
            this.renderSourceItem(discogs_id, 'https://api.discogs.com/artists/', 'discogs', true)
          }
          {spotify_id && !discogs_id &&
            this.renderSourceItem(spotify_id, 'spotify:artist:', 'spotify', false)
          }
          {!spotify_id && discogs_id &&
            this.renderSourceItem(discogs_id, 'https://api.discogs.com/artists/', 'discogs', false)
          }
        </ul>
      </div>
    );
  }

  renderForm() {
    return (
      <div className='submit-container'>
        <a href='' className='link-button' onClick={this.resetDeleteSources}>Cancel</a>
        <Button label='OK' handleClick={this.handleSubmit} />
      </div>
    );
  }

  componentDidMount() {
    const { spotify_id, discogs_id } = this.props.artist;

    if (spotify_id && discogs_id) {
      this.setState({
        showForm: true,
        spotify_id: spotify_id,
        discogs_id: discogs_id
      });
    } else {
      this.setState({
        error: true,
        message: 'Oops! This artist cannot be unmerged because it only has one source!',
        showForm: false,
        spotify_id: spotify_id,
        discogs_id: discogs_id
      });
    }
  }

  componentWillUpdate(nextProps, _nextState) {
    const { artist: artist } = this.props;
    const { artist: nextArtist } = nextProps;

    if ((artist.spotify_id && !nextArtist.spotify_id) || (artist.discogs_id && !nextArtist.discogs_id)) {
      this.setState({
        error: false,
        message: 'Unmerge was successful!',
        showForm: false
      });
    }
  }

  render() {
    const { artist } = this.props;
    const { showForm, message, error, spotify_id, discogs_id } = this.state;

    return (
      <div className='form-container'>
        <form onSubmit={this.handleSubmit}>
          <div className='form-row-container form-row--space-center'>
            {this.renderCard(artist)}
            {this.renderSources(spotify_id, discogs_id)}
          </div>
          {message && <Message message={message} error={error} />}
          {showForm && this.renderForm()}
          <p className='note'>To unmerge an artist means removing a source from this artist. The albums will stay attached to the artist even if you remove a source. An artist should have at least one source.</p>
        </form>
      </div>
    );
  }
}

ArtistUnmerge.propTypes = {
  isAdmin: PropTypes.bool.isRequired,
  artist: PropTypes.object.isRequired,
  updateArtist: PropTypes.func.isRequired
};

const ArtistUnmergeConsumer = (props) => {
  return (
    <ArtistUnmergeContext.Consumer>
      {({ updateArtist }) => <ArtistUnmerge {...props} {...{ updateArtist }} />}
    </ArtistUnmergeContext.Consumer>
  );
}

export default ArtistUnmergeConsumer;
