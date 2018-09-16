import React from 'react';
import PropTypes from 'prop-types';
import Synchronize from '../Synchronize/Synchronize';
import { Link } from 'react-router-dom';
import { getAccessToken, getAndSetUserSavedAlbums } from '../../helpers/SpotifyHelper.js';
import * as fb from '../../helpers/FirebaseHelper.js';

class SpotifySync extends React.Component {

  constructor(props) {
    super();

    // Pagination limit
    this.limit = 50;

    // Get accessToken
    this.accessToken = getAccessToken();

    // set local state
    this.state = {
      error: false,
      message: null,
      loadingMessage: null
    };

    this.handleClick = this.handleClick.bind(this);
  }

  /**
   * Update the Message component props
   * @param  {Boolean} error   Has error
   * @param  {String} message  Message to display
   */
  updateMessage(error, message, loadingMessage) {
    this.setState({
      error: error,
      message: message,
      loadingMessage: loadingMessage
    });
  }

  /**
   * Start fetching first batch of albums
   */
  handleClick() {
    this.updateMessage(false, null, 'Loading albums and artists...');

    getAndSetUserSavedAlbums(this.accessToken, 0)
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
    this.updateMessage(false, 'Loading albums and artists successful!', null);
  }


  /**
   * Display error message when a problem occured
   * @param  {String} message Error message
   */
  handleError(message) {
    this.updateMessage(true, message, null);
  }


  render() {
    return (
      <Synchronize
        message = { this.state.message }
        error = { this.state.error }
        handleClick={ this.handleClick }
        loadingMessage = { this.state.loadingMessage }
      />
    );
  }
}


export default SpotifySync;
