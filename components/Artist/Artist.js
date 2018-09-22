import React from 'react';
import { Redirect } from 'react-router-dom';
import PropTypes from 'prop-types';
import { getRef, getArtist, convertAlbumSummaryToArray, removeArtist } from '../../helpers/FirebaseHelper';
import ArtistSummary from '../ArtistSummary/ArtistSummary';
import Album from '../Album/Album';
import EmptyList from '../EmptyList/EmptyList';
import PageNotFound from '../PageNotFound/PageNotFound';
import Message from '../Message/Message';
import Loading from '../Loading/Loading';
import Button from '../Button/Button';


class Artist extends React.Component {

  constructor(props) {
    super();

    this.state = {
      error: false,
      message: null,
      loaded: false,
      artistData: null,
      toHome: false
    };

    this.handleRemoveSubmit = this.handleRemoveSubmit.bind(this);
  }

  /**
   * Fetch artist from Firebase
   * @param  {String} id Artist Id
   */
  getCurrentArtist(id) {
    getArtist(id)
      .on('value', (snapshot) => this.handleGetArtistSuccess(snapshot.val()));
  }

  /**
   * Format artist's albums if exist. Set artist data to state
   * @param  {Object} artist Firebase artist object
   */
  handleGetArtistSuccess(artist) {
    if (artist && artist.hasOwnProperty('albums')) {
      // Update albums structure in artist object
      artist.albums = convertAlbumSummaryToArray(artist.albums);
    }

    this.setState({
      loaded: true,
      artistData: artist
    });
  }

  /**
   * Set fetching artist error to state
   */
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
    if (!this.state.artistData.hasOwnProperty('albums')) {
      return (
        <div className='content-container'>
          <EmptyList message='This artist does not have any albums.'/>
          <div className='submit-container submit-container--center'>
            <Button label='Remove artist' handleClick={this.handleRemoveSubmit}/>
          </div>
        </div>
      );
    }

    return (
      <div>
        {
          this.state.artistData.albums.map((album) => {
            return (
              <div key={album.id} >
                <Album artistId={this.props.match.params.id} id={album.id} totalTracks={album.totalTracks} isAdmin={this.props.isAdmin}/>
              </div>
            );
          })
        }
      </div>
    );
  }

  componentDidMount() {
    this.getCurrentArtist(this.props.match.params.id);
  }

  componentWillUnmount() {
    getRef('artists/' + this.props.match.params.id).off('value');
  }

  componentWillReceiveProps(nextProps) {
    // Handle page change: fetch new artist
    if (nextProps.match.params.id != this.props.match.params.id) {
      this.getCurrentArtist(nextProps.match.params.id);
    }
  }

  render() {
    if (this.state.toHome) {
      return <Redirect to='/' />;
    }

    if (!this.state.loaded) {
      return <Loading fullPage={true} label={'Loading artist...'}/>;
    }

    if (this.state.error) {
      return (
        <div className='content-container'>
          <Message message={this.state.message} error={this.state.error}/>
        </div>
      );
    }

    if (!this.state.artistData) {
      return <PageNotFound />;
    }

    return (
      <div>
        <ArtistSummary id={this.props.match.params.id} artist={this.state.artistData} />
        { this.renderAlbums() }
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
