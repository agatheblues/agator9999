import React from 'react';
import PropTypes from 'prop-types';
import Button from '../Button/Button';
import Message from '../Message/Message.js';
import SpotifyLogin from '../SpotifyLogin/SpotifyLogin.js';
import SpotifyProfile from '../SpotifyProfile/SpotifyProfile';
import { Link } from 'react-router-dom';
import * as api from '../../DataWrapper/SpotifyDataWrapper.js';
import * as fb from '../../DataWrapper/FirebaseDataWrapper.js';
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
  }

  //TODO: https://reactjs.org/blog/2015/12/16/ismounted-antipattern.html
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
    this.updateMessage(false, 'Loading albums and artists...');

    api.getAndSetUserSavedAlbums(this.accessToken, 0)
      .then(() => this.handleAlbumSyncSuccess())
      .catch((error) => this.handleError(error.message));
  }


  /**
   * On success of fetching a batch of albums, fetch the next one
   * Else, start getting artist images
   * @param  {int} totalAlbums  Total number of albums to fetch
   * @param  {int} offset      Current pagination offset
   */
  handleAlbumSyncSuccess() {
    this.updateMessage(false, 'Loading albums and artists successful!');
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

          {!this.accessToken &&
            <SpotifyLogin redirect='spotify/sync'/>
          }

          {this.state.message &&
            <Message message={this.state.message} error={this.state.error}/>}
          <p className='note'>Synchronize saves all of your Spotify saved albums, and all of their artists to the database. It does not erase your current library but completes it.</p>

        </div>
      </div>
    );
  }
}


export default SpotifySync;
