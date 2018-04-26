import React from 'react';
import PropTypes from 'prop-types';
import Message from '../Message/Message.js';
import ArtistSummary from '../ArtistSummary/ArtistSummary.js';
import Album from '../Album/Album.js';
import {getArtist, getFbDb} from '../../DataWrapper/FirebaseDataWrapper.js';
require('./Artist.scss');

class Artist extends React.Component {

  constructor(props) {
    super();

    this.state = {
      error: false,
      message: null,
      hasArtistData: false,
      artistData: {}
    };

    this.handleGetArtistSuccess = this.handleGetArtistSuccess.bind(this);
    this.handleGetArtistError = this.handleGetArtistError.bind(this);
  }

  handleGetArtistSuccess(artist) {
    this.setState({
      hasArtistData: true,
      artistData: artist
    });
  }

  handleGetArtistError(message) {
    this.setState({
      'error': true,
      'message': message
    });
  }

  renderAlbums() {
    return (
      <div>
        {
          this.state.artistData.albums.map((album, index) => {
            return(
              <div key={index} >
                <Album id={album.id} totalTracks={album.totalTracks}/>
              </div>
            );
          })
        }
      </div>
    );
  }

  componentDidMount() {
    getArtist(this.props.match.params.id, this.handleGetArtistSuccess, this.handleGetArtistError);
  }


  render() {
    return (
      <div>
        {this.state.message && <Message message={this.state.message} error={this.state.error}/>}
        {this.state.hasArtistData &&
            <div>
              <ArtistSummary artist={this.state.artistData} />
              {this.renderAlbums()}
            </div>}
        {!this.state.hasArtistData && <p>Loading...</p>}
      </div>
    );
  }
};

Artist.propTypes = {
  match: PropTypes.shape({
    params: PropTypes.shape({
      id: PropTypes.node,
    }).isRequired,
  }).isRequired
};

export default Artist;
