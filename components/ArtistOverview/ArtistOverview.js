import React from 'react';
import PropTypes from 'prop-types';
import Message from '../Message/Message.js';
import ArtistSummary from '../ArtistSummary/ArtistSummary.js';
import AlbumOverview from '../AlbumOverview/AlbumOverview.js';
import {getArtist, getFbDb} from '../../DataWrapper/FirebaseDataWrapper.js';
require('./ArtistOverview.scss');

class ArtistOverview extends React.Component {

  constructor(props) {
    super();

    this.db = getFbDb();

    this.state = {
      error: false,
      message: null,
      hasArtistData: false,
      artistData: {},
      albumIds: []
    };

    this.handleGetArtistSuccess = this.handleGetArtistSuccess.bind(this);
    this.handleGetArtistError = this.handleGetArtistError.bind(this);
  }

  handleGetArtistSuccess(artist) {
    let ids = artist.albums.map((album) => album.id);

    this.setState({
      hasArtistData: true,
      artistData: artist,
      albumIds: ids
    });
  }

  handleGetArtistError(message) {
    this.setState({
      'error': true,
      'message': message
    });
  }

  renderAlbumOverviews() {
    return (
      <div>
        {
          this.state.albumIds.map((id, index) => {
            return(
              <div key={index} >
                <AlbumOverview id={id} />
              </div>
            );
          })
        }
      </div>
    );
  }

  componentDidMount() {
    getArtist(this.props.match.params.id, this.db, this.handleGetArtistSuccess, this.handleGetArtistError);
  }


  render() {
    return (
      <div>
        {this.state.message && <Message message={this.state.message} error={this.state.error}/>}
        {this.state.hasArtistData &&
            <div>
              <ArtistSummary artist={this.state.artistData} />
              {this.renderAlbumOverviews()}
            </div>}
        {!this.state.hasArtistData && <p>Loading...</p>}
      </div>
    );
  }
};

ArtistOverview.propTypes = {
  match: PropTypes.shape({
    params: PropTypes.shape({
      id: PropTypes.node,
    }).isRequired,
  }).isRequired
};

export default ArtistOverview;
