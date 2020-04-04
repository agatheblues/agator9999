import React from 'react';
import { Redirect } from 'react-router-dom';
import PropTypes from 'prop-types';
// import { getRef, getArtist, convertAlbumSummaryToArray, removeArtist } from '../../helpers/FirebaseHelper';
import { getArtist } from '../../helpers/DataHelper';
import ArtistSummary from '../ArtistSummary/ArtistSummary';
import Album from '../Album/Album';
import EmptyList from '../EmptyList/EmptyList';
import PageNotFound from '../PageNotFound/PageNotFound';
import Message from '../Message/Message';
import Loading from '../Loading/Loading';
import Button from '../Button/Button';


class Artist extends React.Component {

  constructor() {
    super();

    this.state = {
      error: false,
      message: null,
      loaded: false,
      artist: null,
      toHome: false
    };

    this.handleRemoveSubmit = this.handleRemoveSubmit.bind(this);
  }

  getCurrentArtist(id) {
    getArtist(id)
      .then((response) => this.handleGetArtistSuccess(response))
      .catch((error) => this.handleGetArtistError());
  }

  handleGetArtistSuccess(response) {
    const { data } = response;

    this.setState({
      loaded: true,
      artist: data
    });
  }

  handleGetArtistError() {
    this.setState({
      error: true,
      loaded: true,
      message: 'Oops! There was a problem while retrieving data for this artist.'
    });
  }

  handleRemoveSubmit() {
    removeArtist(this.props.match.params.id)
      .then(() => this.handleRemoveSuccess())
      .catch((error) => this.handleRemoveError());
  }

  handleRemoveSuccess() {
    this.setState({
      toHome: true
    });
  }

  handleRemoveError() {
    this.setState({
      error: true,
      message: 'Oops! There was a problem while removing this artist.'
    });
  }

  /**
   * Renders an Album component for each artist' album
   * @return {String} HTML Markup
   */
  renderAlbums() {
    const { artist: { albums } } = this.state;

    if (albums.length === 0) {
      return (
        <div className='content-container'>
          <EmptyList message='This artist does not have any albums.' />
          <div className='submit-container submit-container--center'>
            <Button label='Remove artist' handleClick={this.handleRemoveSubmit} />
          </div>
        </div>
      );
    }

    return albums.map((album, index) =>
      <Album key={index} artistId={this.props.match.params.id} album={album} isAdmin={this.props.isAdmin} />
    );
  }

  componentDidMount() {
    this.getCurrentArtist(this.props.match.params.id);
  }

  componentWillReceiveProps(nextProps) {
    // Handle page change: fetch new artist
    if (nextProps.match.params.id != this.props.match.params.id) {
      this.getCurrentArtist(nextProps.match.params.id);
    }
  }

  render() {
    const { toHome, loaded, error, artist, message } = this.state;

    if (toHome) {
      return <Redirect to='/' />;
    }

    if (!loaded) {
      return <Loading fullPage={true} label={'Loading artist...'} />;
    }

    if (error) {
      return (
        <div className='content-container'>
          <Message message={message} error={error} />
        </div>
      );
    }

    if (!artist) {
      return <PageNotFound />;
    }

    return (
      <div>
        <ArtistSummary id={this.props.match.params.id} artist={artist} />
        {this.renderAlbums()}
      </div>
    );
  }
}

Artist.propTypes = {
  match: PropTypes.shape({
    params: PropTypes.shape({
      id: PropTypes.node,
    }).isRequired,
  }).isRequired,
  isAdmin: PropTypes.bool.isRequired
};

export default Artist;
