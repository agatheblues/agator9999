import React from 'react';
import { Link } from 'react-router-dom';
import Synchronize from '../components/Synchronize/Synchronize';
import { getAccessToken } from '../helpers/SpotifyHelper.js';
import { synchronizeSpotifyCollection } from '../helpers/DataHelper.js';
import { getBatch } from '../helpers/ApiHelper.js';

class SpotifySyncPage extends React.Component {

  constructor() {
    super();

    this.limit = 50;

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
    this.updateMessage(false, null, 'Loading collection...');

    synchronizeSpotifyCollection(this.accessToken, this.limit)
      .then(({ data }) => this.handleAlbumSyncSuccess(data))
      .catch((error) => this.handleError(error));
  }

  /**
   * On success of fetching a batch of albums, fetch the next one
   * Else, start getting artist images
   * @param  {int} totalAlbums  Total number of albums to fetch
   * @param  {int} offset      Current pagination offset
   */
  handleAlbumSyncSuccess(data) {
    const batchId = data.batch_id;
    this.checkBatchStatus(data.batch_id);
  }

  /**
   * Display error message when a problem occured
   * @param  {String} message Error message
   */
  handleError(error) {
    this.updateMessage(true, error.message, null);
  }

  checkBatchStatus(batchId) {
    getBatch(batchId)
      .then(({ data }) => {
        if (data.status === 'complete') {
          this.updateMessage(false, 'Loading collection was successful!', null);
        } else {
          setTimeout(() => {
            this.checkBatchStatus(batchId)
          }, 2000);
        }
      })
      .catch((error) => this.handleError(error));
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
