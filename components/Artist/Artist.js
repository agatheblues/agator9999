import React from 'react';
import PropTypes from 'prop-types';
import ArtistSummary from '../ArtistSummary/ArtistSummary.js';
import Album from '../Album/Album.js';
import Message from '../Message/Message.js';
import {getArtist, convertAlbumSummaryToArray} from '../../DataWrapper/FirebaseDataWrapper.js';
require('./Artist.scss');

class Artist extends React.Component {

  constructor(props) {
    super();

    this.state = {
      error: false,
      hasArtistData: false,
      artistData: {}
    };

    this.handleGetArtistSuccess = this.handleGetArtistSuccess.bind(this);
    this.handleGetArtistError = this.handleGetArtistError.bind(this);
  }

  handleGetArtistSuccess(artist) {
    
    // Update albums structure in artist object
    artist.albums = convertAlbumSummaryToArray(artist.albums);

    this.setState({
      hasArtistData: true,
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
    getArtist(this.props.match.params.id)
      .then((snapshot) => this.handleGetArtistSuccess(snapshot.val()))
      .catch((error) => this.handleGetArtistError());
  }


  render() {
    return (
      <div>
        {this.state.hasArtistData && !this.state.error &&
            <div>
              <ArtistSummary artist={this.state.artistData} />
              {this.renderAlbums()}
            </div>}
        {!this.state.hasArtistData && !this.state.error &&
            <div className='content-container'>
              <p>Loading...</p>
            </div>
        }
        {this.state.error &&
          <div className='content-container'>
            <Message message='Oops! There was a problem while retrieving data for this artist.' error={this.state.error}/>
          </div>
        }
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
