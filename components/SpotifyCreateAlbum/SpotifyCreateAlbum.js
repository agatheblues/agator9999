import React from 'react';
import PropTypes from 'prop-types';
import Button from '../Button/Button';
import SpotifyLogin from '../SpotifyLogin/SpotifyLogin';
import Message from '../Message/Message';
import * as api from '../../helpers/SpotifyHelper';
import * as fb from '../../helpers/FirebaseHelper';

class SpotifyCreateAlbum extends React.Component {
  constructor(props) {
    super();

    // Get accessToken
    this.accessToken = api.getAccessToken();

    // set local state
    this.state = {
      value: '',
      error: false,
      messageForm: null,
      message: null,
      accessToken: this.accessToken
    };

    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleChange(event) {
    this.setState({value: event.target.value});
  }

  checkSpotifyUri(s) {
    return s.indexOf('spotify:album:') == 0;
  }

  getSpotifyId(s) {
    return s.substring(14);
  }

  handleError(message) {
    this.setState({
      error: true,
      message: message
    });
  }

  handleSuccess() {
    this.setState({
      error: false,
      message: 'Album successfully added to your library!'
    });
  }

  updateMessages(messageForm, message) {
    this.setState({
      messageForm: messageForm,
      message: message
    });
  }

  handleSubmitMessages() {
    // Check if input is as expected
    if (!this.checkSpotifyUri(this.state.value)) {
      this.updateMessages('URI should be formed as spotify:album:...', null);
      return;
    }

    // Clear all error messages
    this.updateMessages(null, null);
  }

  getArtistIds(artists) {
    return artists.map((artist) => artist.id);
  }

  handleSubmit(event) {
    event.preventDefault();

    this.handleSubmitMessages();

    // Set album, artist, and artist images
    api.getAlbum(this.accessToken, this.getSpotifyId(this.state.value))
      .then(({data}) => Promise.all([
        fb.setAlbumIfNotExists(fb.formatAlbum(data)),
        fb.updateOrSetArtistsFromSingleAlbum(fb.formatArtists(data.artists), fb.formatSingleAlbumSummary(data))
          .then(() => api.getArtistsImages(this.accessToken, this.getArtistIds(data.artists)))
      ]))
      .then(() => this.handleSuccess())
      .catch((error) => this.handleError(error.message));
  }

  render() {
    return (
      <div>
        {!this.accessToken &&
          <div>
            <p>You must login first.</p>
            <SpotifyLogin redirect='album/create' />
          </div>
        }
        {this.accessToken &&
          <div>
            <p>To add an album from Spotify, copy its Spotify URI.</p>
            <form onSubmit={this.handleSubmit}>
              <div className='input-container'>
                <label>Spotify URI:</label>
                <input
                  type='text'
                  spellCheck='false'
                  value={this.state.value}
                  onChange={this.handleChange}
                  className='form-input-text'
                  placeholder='spotify:album:...'
                />
              </div>

              {this.state.message &&
                <Message message={this.state.message} error={this.state.error}/>
              }
              {this.state.messageForm &&
                <div className='input-error-container'>
                  <p className='input-error'>{this.state.messageForm}</p>
                </div>
              }
              <div className='submit-container'>
                <Button label='OK' handleClick={this.handleSubmit}/>
              </div>
            </form>
          </div>
        }
      </div>
    );
  }
}

export default SpotifyCreateAlbum;
