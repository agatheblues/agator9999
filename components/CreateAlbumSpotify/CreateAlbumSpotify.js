import React from 'react';
import PropTypes from 'prop-types';
import Button from '../Button/Button';
import SpotifyLogin from '../SpotifyLogin/SpotifyLogin';
import * as api from '../../DataWrapper/SpotifyDataWrapper.js';
require('./CreateAlbumSpotify.scss');

class CreateAlbumSpotify extends React.Component {
  constructor(props) {
    super();

    // Get accessToken
    this.accessToken = api.getAccessToken();

    // Axios instance
    this.instance = api.getInstance(this.accessToken);

    // set local state
    this.state = {
      value: '',
      error: false,
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

  handleSubmit(event) {
    event.preventDefault();

    if (!this.checkSpotifyUri(this.state.value)) {
      this.setState({
        message: 'URI be should formed as spotify:album:...'
      });
    } else {
      this.setState({
        message: 'Getting album !'
      });
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
                <div className='input-error-container'>
                  <p className='input-error'>{this.state.message}</p>
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
