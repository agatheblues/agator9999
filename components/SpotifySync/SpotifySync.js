import React from 'react';
import PropTypes from 'prop-types';
import Button from '../Button/Button';
import Message from '../Message/Message.js';
import SpotifyLogin from '../SpotifyLogin/SpotifyLogin.js';
import SpotifyProfile from '../SpotifyProfile/SpotifyProfile';
import { Link } from 'react-router-dom';
import * as api from '../../DataWrapper/SpotifyDataWrapper.js';


class SpotifySync extends React.Component {

  constructor(props) {
    super();

    // Pagination limit
    this.limit = 50;

    // Get accessToken
    this.accessToken = api.getAccessToken();

    // set local state
    this.state = {
      error: false,
      message: null
    };

    this.handleClick = this.handleClick.bind(this);
    this.handleAlbumSyncSuccess = this.handleAlbumSyncSuccess.bind(this);
    this.handleSyncImageSuccess = this.handleSyncImageSuccess.bind(this);
    this.handleError = this.handleError.bind(this);
    this.getImages = this.getImages.bind(this);
  }

  handleAlbumSyncSuccess(hasNextPage, totalItems, offset) {

    if (this.accessToken) {

      if (offset < totalItems) {
        const upperLimit = ((offset + 2*this.limit) >= totalItems) ? totalItems : (offset + 2*this.limit);
        console.log('kiki');
        this.setState({
          'error': false,
          'message': 'Loading albums ' + (offset + this.limit) + ' - ' + upperLimit + ' of ' + totalItems
        });

        api.setAlbums(this.accessToken, offset + this.limit, this.limit, this.handleAlbumSyncSuccess, this.handleError);
      } else {
        console.log('caca');
        this.setState({
          'error': false,
          'message': 'Loading albums successful!'
        });
      }
    }
  }

  getImages() {
    this.setState({
      'error': false,
      'message': 'Loading artist images...'
    });

    api.getArtistImages(this.accessToken, this.handleSyncImageSuccess, this.handleError);
  }

  handleSyncImageSuccess() {
    this.setState({
      'error': false,
      'message': 'Loaded artist images! Spotify sync is complete.'
    });
  }

  handleError(message) {
    this.setState({
      'error': true,
      'message': message
    });
  }

  handleClick() {
    this.setState({
      'error': false,
      'message': 'Loading albums 0 - ' + this.limit
    });

    api.setAlbums(this.accessToken, 0, this.limit, this.handleAlbumSyncSuccess, this.handleError);
  }

  render() {
    return (
      <div className='content-container'>
        {this.state.message && <Message message={this.state.message} error={this.state.error}/>}
        <div className='back-to-library'>
          <Link to='/'>&#9839; Back to library</Link>
        </div>
        {this.accessToken &&
          <div>
            <SpotifyProfile />
            <Button
              label={'Sync your Spotify music'}
              handleClick={this.handleClick}
            />
          </div>
        }
        {!this.accessToken &&
          <SpotifyLogin redirect='spotify/sync'/>
        }
      </div>
    );
  }
}


export default SpotifySync;
