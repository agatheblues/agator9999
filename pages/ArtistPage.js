import React from 'react';
import PropTypes from 'prop-types';
import { getArtist, deleteAlbum } from '../helpers/ApiHelper';
import { updateAlbumWithDiscogs } from '../helpers/DataHelper';
import { ArtistContext } from '../context/ArtistContext';
import ArtistSummary from '../components/ArtistSummary/ArtistSummary';
import AlbumList from '../components/AlbumList/AlbumList';
import PageNotFound from '../components/PageNotFound/PageNotFound';
import Message from '../components/Message/Message';
import Loading from '../components/Loading/Loading';
import EmptyList from '../components/EmptyList/EmptyList';

class ArtistPage extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      error: false,
      message: null,
      loaded: false,
      artist: null,
      showArtistDeleted: false,
      deleteAlbum: this.deleteAlbum.bind(this),
      updateAlbum: this.updateAlbum.bind(this)
    };
  }

  getCurrentArtist(id) {
    getArtist(id)
      .then((response) => this.handleGetArtistSuccess(response))
      .catch((error) => this.handleGetArtistError(error));
  }

  /**
   * Callback to delete an album from the artist.
   * If this was the artist's only album, when fetching the artist 
   * the backend will respond with 404. We gracefully handle this case
   * by providing a link back to artists#index to the user.
   * @param {Number} albumId 
   */
  deleteAlbum(albumId) {
    deleteAlbum(albumId)
      .then(() => getArtist(this.props.match.params.id))
      .then((response) => this.handleGetArtistSuccess(response))
      .catch((error) => {
        if (error.response.status === 404) {
          this.handleRemoveArtistSuccess();
        } else {
          this.handleRemoveArtistError();
        }
      });
  }

  updateAlbum(albumId, discogsUri, releaseType) {
    updateAlbumWithDiscogs(albumId, discogsUri, releaseType)
      .then(() => getArtist(this.props.match.params.id))
      .then((response) => this.handleGetArtistSuccess(response))
      .catch(() => this.handleGetArtistError());
  }

  handleGetArtistSuccess({ data }) {
    this.setState({
      artist: data,
      loaded: true
    });
  }

  handleGetArtistError(error) {
    if (error.response.status === 404) {
      this.setState({
        loaded: true
      })
    } else {
      this.setState({
        error: true,
        loaded: true,
        message: 'Oops! There was a problem while retrieving data for this artist.'
      });
    }
  }

  handleRemoveArtistSuccess() {
    this.setState({
      showArtistDeleted: true
    });
  }

  handleRemoveArtistError() {
    this.setState({
      error: true,
      message: 'Oops! There was a problem while removing this artist or album.'
    });
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

  renderDeletedArtist() {
    return (
      <div className='content-container'>
        <EmptyList message='This artist was deleted: it does not have any album.' link={'/'} linkText={'Back to library'} />
      </div>
    );
  }
  render() {
    const { showArtistDeleted, loaded, error, artist, message } = this.state;

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
      <ArtistContext.Provider value={this.state}>
        <ArtistSummary showArtistDeleted={showArtistDeleted} />
        {!showArtistDeleted && <AlbumList albums={artist.albums} />}
        {showArtistDeleted && this.renderDeletedArtist()}
      </ArtistContext.Provider>
    );
  }
}

ArtistPage.propTypes = {
  match: PropTypes.shape({
    params: PropTypes.shape({
      id: PropTypes.node,
    }).isRequired,
  }).isRequired
};

export default ArtistPage;
