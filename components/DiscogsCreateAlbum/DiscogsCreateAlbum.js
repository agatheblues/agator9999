import React from 'react';
import PropTypes from 'prop-types';
import Button from '../Button/Button';
import Message from '../Message/Message';
import * as dg from '../../helpers/DiscogsHelper';
import * as fb from '../../helpers/FirebaseHelper';
require('./DiscogsCreateAlbum.scss');

class DiscogsCreateAlbum extends React.Component {
  constructor(props) {
    super();

    // set local state
    this.state = {
      value: 'https://www.discogs.com/Trio-Da-Kali-And-Kronos-Quartet-Ladilikan/master/1248850',
      error: false,
      messageForm: null,
      message: null
    };

    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleChange(event) {
    this.setState({value: event.target.value});
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
    // // Check if input is as expected
    // if (!this.checkSpotifyUri(this.state.value)) {
    //   this.updateMessages('URI should be formed as spotify:album:...', null);
    //   return;
    // }

    // Clear all error messages
    this.updateMessages(null, null);
  }

  getArtistIds(artists) {
    return artists.map((artist) => artist.id);
  }

  handleSubmit(event) {
    event.preventDefault();

    this.handleSubmitMessages();

    dg.getRelease(this.state.value, 'master')
      .then(({data}) => {
        console.log('coucou', data);
        return fb.setAlbumIfNotExists(fb.formatDiscogsAlbum(data));
      });
    // // Set album, artist, and artist images
    // api.getAlbum(this.accessToken, this.getSpotifyId(this.state.value))
    //   .then(({data}) => Promise.all([
    //     fb.setAlbumIfNotExists(fb.formatAlbum(data)),
    //     fb.updateOrSetArtistsFromSingleAlbum(fb.formatArtists(data.artists), fb.formatSingleAlbumSummary(data))
    //       .then(() => api.getArtistsImages(this.accessToken, this.getArtistIds(data.artists)))
    //   ]))
    //   .then(() => this.handleSuccess())
    //   .catch((error) => this.handleError(error.message));
  }

  render() {
    console.log(this.state);
    return (
      <div>
        <div>
          <p>To add an album from Discogs, copy the Url to the Id</p>
          <form onSubmit={this.handleSubmit}>
            <div className='input-container'>
              <label>Discogs URI:</label>
              <input
                type='text'
                spellCheck='false'
                value={this.state.value}
                onChange={this.handleChange}
                className='form-input-text'
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
      </div>
    );
  }
}


export default DiscogsCreateAlbum;
