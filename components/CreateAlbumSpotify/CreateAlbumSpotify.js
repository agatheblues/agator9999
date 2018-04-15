import React from 'react';
import PropTypes from 'prop-types';
import Button from '../Button/Button';
import * as api from '../../DataWrapper/SpotifyDataWrapper.js';
require('./CreateAlbumSpotify.scss');

class CreateAlbumSpotify extends React.Component {
  constructor(props) {
    super();
    this.state = {
      value: '',
      errorMessage: ''
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
        errorMessage: 'URI be should formed as spotify:album:...'
      });
    } else {
      this.setState({
        errorMessage: ''
      });
    }
  }

  render() {
    return (
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

          {this.state.errorMessage != '' &&
            <div className='input-error-container'>
              <p className='input-error'>{this.state.errorMessage}</p>
            </div>
          }
          <div className='submit-container'>
            <Button label='OK' handleClick={this.handleSubmit}/>
          </div>
        </form>
      </div>
    );
  }
}

export default CreateAlbumSpotify;
