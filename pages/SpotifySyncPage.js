import React from 'react';
import { Link } from 'react-router-dom';
import Synchronize from '../components/Synchronize/Synchronize';
import { getAccessToken } from '../helpers/SpotifyHelper.js';
import { synchronizeSpotifyAlbums } from '../helpers/DataHelper.js';

class SpotifySyncPage extends React.Component {

  constructor() {
    super();

    this.accessToken = getAccessToken();

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

    synchronizeSpotifyAlbums(this.accessToken, 0)
      .then(() => this.handleAlbumSyncSuccess())
      .catch((error) => this.handleError(error));
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
  handleError(error) {
    console.log("Handles error:", error)
    this.updateMessage(true, error.message, null);
  }

  render() {
    return (
      <div className='content-container'>
        <div className='back-to-library'>
          <Link to='/'>&#9839; Back to library</Link>
        </div>
        <h2>Synchronize your Spotify saved albums</h2>
        <Synchronize
          message={this.state.message}
          error={this.state.error}
          handleClick={this.handleClick}
          loadingMessage={this.state.loadingMessage}
        />
      </div>
    );
  }
}


export default SpotifySyncPage;
