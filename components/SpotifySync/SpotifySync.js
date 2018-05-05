import React from 'react';
import PropTypes from 'prop-types';
import Button from '../Button/Button';
import Message from '../Message/Message.js';
import SpotifyLogin from '../SpotifyLogin/SpotifyLogin.js';
import SpotifyProfile from '../SpotifyProfile/SpotifyProfile';
import { Link } from 'react-router-dom';
import * as api from '../../DataWrapper/SpotifyDataWrapper.js';
require('./SpotifySync.scss');

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
  }

  /**
   * Update the Message component props
   * @param  {Boolean} error   Has error
   * @param  {String} message  Message to display
   */
  updateMessage(error, message) {
    this.setState({
      error: error,
      message: message
    });
  }

  /**
   * Start fetching first batch of albums
   */
  handleClick() {
    this.updateMessage(false, 'Loading albums 0 - ' + this.limit);
    api.setAlbumsThenArtists(this.accessToken, 0, this.limit, this.handleAlbumSyncSuccess, this.handleError);
  }


  /**
   * On success of fetching a batch of albums, fetch the next one
   * Else, start getting artist images
   * @param  {int} totalAlbums  Total number of albums to fetch
   * @param  {int} offset      Current pagination offset
   */
  handleAlbumSyncSuccess(totalAlbums, offset) {

    if (this.accessToken) {
      if (offset < totalAlbums) {

        // Update message
        const upperLimit = ((offset + 2*this.limit) >= totalAlbums) ? totalAlbums : (offset + 2*this.limit);
        this.updateMessage(false, 'Loading albums ' + (offset + this.limit) + ' - ' + upperLimit + ' of ' + totalAlbums);

        // Load next batch of albums
        api.setAlbumsThenArtists(this.accessToken, offset + this.limit, this.limit, this.handleAlbumSyncSuccess, this.handleError);

      } else {

        // Start fetching artist images
        this.updateMessage(false, 'Loading albums and artists successful! Loading artist images...');
        api.getThenSetArtistImages(this.accessToken, this.handleSyncImageSuccess, this.handleError);

      }
    }
  }

  /**
   * Display success message when all artist images have been fetched
   */
  handleSyncImageSuccess() {
    this.updateMessage(false, 'Loaded artist images! Spotify sync is complete.');
  }

  /**
   * Display error message when a problem occured
   * @param  {String} message Error message
   */
  handleError(message) {
    this.updateMessage(true, message);
  }


  render() {
    return (
      <div className='content-container'>
        <div className='back-to-library'>
          <Link to='/'>&#9839; Back to library</Link>
        </div>

        <h2>Synchronize your Spotify saved albums</h2>

        <div className='form-container'>
          {this.accessToken &&
            <div className='sync-container'>
              <SpotifyProfile />
              <Button
                label={'Synchronize'}
                handleClick={this.handleClick}
              />
            </div>
          }


          {this.state.message &&
            <Message message={this.state.message} error={this.state.error}/>}
          <p className='note'>Synchronize saves all of your Spotify saved albums, and all of their artists to the database. It does not erase your current library but completes it.</p>

          {!this.accessToken &&
            <SpotifyLogin redirect='spotify/sync'/>
          }
        </div>
      </div>
    );
  }
}


export default SpotifySync;
