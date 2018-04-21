import React from 'react';
import PropTypes from 'prop-types';
import Button from '../Button/Button';
import Message from '../Message/Message.js';
import SpotifyLogin from '../SpotifyLogin/SpotifyLogin.js';
import SpotifyProfile from '../SpotifyProfile/SpotifyProfile';
import { Link } from 'react-router-dom';
import * as api from '../../DataWrapper/SpotifyDataWrapper.js';
import {getFbDb} from '../../DataWrapper/FirebaseDataWrapper.js';


class SpotifySync extends React.Component {

  constructor(props) {
    super();

    this.db = getFbDb();

    // Pagination limit
    this.limit = 50;

    // Get accessToken
    this.accessToken = api.getAccessToken();

    // Axios instance
    this.instance = api.getInstance(this.accessToken);

    // set local state
    this.state = {
      error: false,
      message: null,
      accessToken: this.accessToken
    };

    this.handleClick = this.handleClick.bind(this);
    this.handleSyncSuccess = this.handleSyncSuccess.bind(this);
    this.handleSyncImageSuccess = this.handleSyncImageSuccess.bind(this);
    this.handleError = this.handleError.bind(this);
    this.getImages = this.getImages.bind(this);
  }

  handleSyncSuccess(hasNextPage, totalItems, offset) {

    if (this.state.accessToken) {

      if (offset + this.limit < totalItems) {
        const upperLimit = ((offset + 2*this.limit) >= totalItems) ? totalItems : (offset + 2*this.limit);

        this.setState({
          'error': false,
          'message': 'Loading albums ' + (offset + this.limit) + ' - ' + upperLimit + ' of ' + totalItems
        });

        api.setAlbumsAndArtists(this.instance, offset + this.limit, this.limit, this.db, this.handleSyncSuccess, this.handleError);
      } else {
        api.setAlbumsAndArtists(this.instance, offset + this.limit, this.limit, this.db, this.getImages, this.handleError);
      }
    }
  }

  getImages() {
    this.setState({
      'error': false,
      'message': 'Loading artist images...'
    });

    api.getArtistImages(this.instance, this.db, this.handleSyncImageSuccess, this.handleError);
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
    api.setAlbumsAndArtists(this.instance, 0, this.limit, this.db, this.handleSyncSuccess, this.handleError);
  }

  render() {
    return (
      <div className='content-container'>
        {this.state.message && <Message message={this.state.message} error={this.state.error}/>}
        <div className='back-to-library'>
          <Link to='/'>&#9839; Back to library</Link>
        </div>
        {this.state.accessToken &&
          <div>
            <SpotifyProfile />
            <Button
              label={'Sync your Spotify music'}
              handleClick={this.handleClick}
            />
          </div>
        }
        {!this.state.accessToken &&
          <SpotifyLogin redirect='spotify/sync'/>
        }
      </div>
    );
  }
}


export default SpotifySync;