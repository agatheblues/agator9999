import React from 'react';
import PropTypes from 'prop-types';
import Message from '../Message/Message.js';
import {getAlbum, getFbDb} from '../../DataWrapper/FirebaseDataWrapper.js';
require('./Album.scss');

class Album extends React.Component {

  constructor(props) {
    super();

    this.months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];

    this.state = {
      error: false,
      message: null,
      hasAlbumData: false,
      albumData: {}
    };

    this.handleGetAlbumSuccess = this.handleGetAlbumSuccess.bind(this);
    this.handleGetAlbumError = this.handleGetAlbumError.bind(this);
    this.formatDate = this.formatDate.bind(this);
  }

  formatDate(dateString) {
    const date = new Date(dateString);
    let month = this.months[date.getMonth()];
    return month + ', ' + date.getFullYear();
  }

  handleGetAlbumSuccess(album) {
    // Format date
    album.added_at = this.formatDate(album.added_at);
    album.release_date = album.release_date.substr(0, 4);

    this.setState({
      hasAlbumData: true,
      albumData: album
    });
  }

  handleGetAlbumError(message) {
    this.setState({
      'error': true,
      'message': message
    });
  }

  componentDidMount() {
    getAlbum(this.props.id, this.handleGetAlbumSuccess, this.handleGetAlbumError);
  }

  renderAlbumCover() {
    let src = '';

    if (!this.state.albumData.hasOwnProperty('images') || this.state.albumData.images.length == 0) {
      src = '/static/images/missing.jpg';
    } else {
      src = this.state.albumData.images[0].url;
    }

    return <a href={this.state.albumData.url}><img src={src} alt={'Album Cover'} className='album-cover'/></a>;
  }

  render() {

    return (
      <div className='content-container'>
        <div className='album-wrapper'>
          <div className='album-cover-container'>
            {this.renderAlbumCover()}
          </div>
          <div className='album-detail-container'>
            <h2>{this.state.albumData.name}</h2>
            <div className='album-main-details'>
              <p>{this.state.albumData.release_date}&emsp;/&emsp;{this.props.totalTracks} tracks</p>
              <p><a href={this.state.albumData.url}>&#9836; {`Listen on ${this.state.albumData.source}`}</a></p>
            </div>
            <div className='album-minor-details'>
              <p>{`Added on ${this.state.albumData.added_at}`}</p>
              <p>Tags: </p>
            </div>
          </div>
        </div>
      </div>
    );
  }
};

Album.propTypes = {
  id: PropTypes.string.isRequired,
  totalTracks: PropTypes.number.isRequired
};

export default Album;
