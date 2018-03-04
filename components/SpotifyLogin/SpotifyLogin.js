import React from 'react';
import PropTypes from 'prop-types';
import Button from '../Button/Button';
import axios from 'axios';

class SpotifyLogin extends React.Component {

  constructor(props) {
    super(props);
    console.log('COUCOU');
    // Constants
    this.stateKey = 'spotify_auth_state';
    this.client_id = '349fcdbe411c472eac393c9fdcc73b13'; // Your client id
    this.redirect_uri = 'http://localhost:8888'; // Your redirect uri
    this.scope = 'user-read-private user-read-email user-library-read';
    this.url = 'https://accounts.spotify.com/authorize';
    this.storedState = localStorage.getItem(this.stateKey);

    // URL dependencies
    this.params = this.getHashParams();
    this.access_token = this.params.access_token;
    this.urlState = this.params.state;

    // Axios instance
    this.instance = axios.create({
      baseURL: 'https://api.spotify.com/v1/',
      timeout: 1000,
      headers: {'Authorization': 'Bearer ' + this.access_token}
    });

    this.handleClick = this.handleClick.bind(this);
  }

  /**
   * Obtains parameters from the hash of the URL
   * @return Object
   */
  getHashParams() {
    let hashParams = {};
    let e, r = /([^&;=]+)=?([^&;]*)/g,
      q = window.location.hash.substring(1);
    while ( e = r.exec(q)) {
      hashParams[e[1]] = decodeURIComponent(e[2]);
    }
    return hashParams;
  }

  /**
   * Generates a random string containing numbers and letters
   * @param  {number} length The length of the string
   * @return {string} The generated string
   */
  generateRandomString(length) {
    let text = '';
    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

    for (var i = 0; i < length; i++) {
      text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
  };

  /**
   * Handle click button to request Spotify authentication
   */
  handleClick() {
    console.log('Click happened');
    this.urlState = this.generateRandomString(16);

    localStorage.setItem(this.stateKey, this.urlState);

    this.url += '?response_type=token';
    this.url += '&client_id=' + encodeURIComponent(this.client_id);
    this.url += '&scope=' + encodeURIComponent(this.scope);
    this.url += '&redirect_uri=' + encodeURIComponent(this.redirect_uri);
    this.url += '&state=' + encodeURIComponent(this.urlState);

    window.location = this.url;
  }

  componentDidMount() {
    if (this.access_token && (this.urlState == null || this.urlState !== this.storedState)) {
      alert('There was an error during the authentication');
    } else {
      localStorage.removeItem(this.stateKey);
      if (this.access_token) {
        this.instance.get('/me')
          .then(function (response) {
            console.log(response);
          })
          .catch(function (error) {
            console.log(error);
          });
      } else {
        // $('#login').show();
        // $('#loggedin').hide();
      }
    }
  }

  render() {
    return (
      <Button
        id={'Matthias'}
        label={'Log in with Spotify'}
        handleClick={this.handleClick}
      />
    );
  }
}

export default SpotifyLogin;
