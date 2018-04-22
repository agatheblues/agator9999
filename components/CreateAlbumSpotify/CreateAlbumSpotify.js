import React from 'react';
import PropTypes from 'prop-types';
import Button from '../Button/Button';
import SpotifyLogin from '../SpotifyLogin/SpotifyLogin';
import Message from '../Message/Message';
import * as api from '../../DataWrapper/SpotifyDataWrapper.js';
require('./CreateAlbumSpotify.scss');

class CreateAlbumSpotify extends React.Component {
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
    this.handleSuccess = this.handleSuccess.bind(this);
    this.handleError = this.handleError.bind(this);
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
      'error': true,
      'message': message
    });
  }

  handleSuccess(message) {
    this.setState({
      'error': false,
      'message': message
    });
  }

  handleSubmit(event) {
    event.preventDefault();

    if (!this.checkSpotifyUri(this.state.value)) {
      this.setState({
        messageForm: 'URI should be formed as spotify:album:...'
      });
    } else {
      this.setState({
        messageForm: ''
      });

      api.createAlbum(this.accessToken, this.getSpotifyId(this.state.value), this.handleSuccess, this.handleError);
    }
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

export default CreateAlbumSpotify;
