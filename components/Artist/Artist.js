import React from 'react';
import PropTypes from 'prop-types';
import ArtistSummary from '../ArtistSummary/ArtistSummary';
import Album from '../Album/Album';
import PageNotFound from '../PageNotFound/PageNotFound';
import Message from '../Message/Message';
import Loading from '../Loading/Loading';
import { getArtist, convertAlbumSummaryToArray } from '../../helpers/FirebaseHelper';
require('./Artist.scss');

class Artist extends React.Component {

  constructor(props) {
    super();

    this.state = {
      error: false,
      loaded: false,
      artistData: null
    };
  }

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

  handleGetArtistError() {
    this.setState({
      error: true
    });
  }

  renderAlbums() {
    return (
      <div>
        {
          this.state.artistData.albums.map((album, index) => {
            return (
              <div key={album.id} >
                <Album id={album.id} totalTracks={album.totalTracks} isAdmin={this.props.isAdmin}/>
              </div>
            );
          })
        }
      </div>
    );
  }
  
  getCurrentArtist(id) {
    getArtist(id)
      .then((snapshot) => this.handleGetArtistSuccess(snapshot.val()))
      .catch((error) => this.handleGetArtistError());
  }

  componentDidMount() {
    this.getCurrentArtist(this.props.match.params.id);
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.match.params.id != this.props.match.params.id) {
      this.getCurrentArtist(nextProps.match.params.id);
    }
  }

  render() {
    if (!this.state.loaded) {
      return <Loading />;
    }

    if (this.state.error) {
      return (
        <div className='content-container'>
          <Message message='Oops! There was a problem while retrieving data for this artist.' error={this.state.error}/>
        </div>
      );
    }

    if (!this.state.artistData) {
      return <PageNotFound />;
    }

    return (
      <div>
        <ArtistSummary artist={this.state.artistData} />
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
