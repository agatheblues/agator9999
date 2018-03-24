import axios from 'axios';
import * as fb from './FirebaseDataWrapper.js';

// Constants
const SPOTIFY_LOGIN_URL = 'https://accounts.spotify.com/authorize';
const STATE_KEY = 'spotify_auth_state';
const CLIENT_ID = '349fcdbe411c472eac393c9fdcc73b13';
const REDIRECT_URI = 'http://localhost:8888';
const SCOPE = 'user-read-private user-read-email user-library-read';

/**
 * Create axios instance for Spotify API requests
 * @param  {string} access_token Spotify API Access token retrieved after login
 * @return {func}              Axios instance
 */
export function getInstance(access_token) {
  return axios.create({
    baseURL: 'https://api.spotify.com/v1/',
    timeout: 1000,
    headers: {'Authorization': 'Bearer ' + access_token}
  });
}


/**
 * Build URL to login authentication
 * @return {string} URL
 */
export function getLoginUrl() {
  const urlState = generateRandomString(16);

  localStorage.setItem(STATE_KEY, urlState);
  let url = SPOTIFY_LOGIN_URL;

  url += '?response_type=token';
  url += '&client_id=' + encodeURIComponent(CLIENT_ID);
  url += '&scope=' + encodeURIComponent(SCOPE);
  url += '&redirect_uri=' + encodeURIComponent(REDIRECT_URI);
  url += '&state=' + encodeURIComponent(urlState);

  return url;
}


/**
 * Get value of state in local storage
 * @return {string} Value of state
 */
export function getStateKey() {
  return localStorage.getItem(STATE_KEY);
}

/**
 * Obtains parameters from the hash of the URL
 * @return Object
 */
export function getHashParams() {
  let hashParams = {};
  let e, r = /([^&;=]+)=?([^&;]*)/g,
    q = window.location.hash.substring(1);
  while ( e = r.exec(q)) {
    hashParams[e[1]] = decodeURIComponent(e[2]);
  }
  return hashParams;
}

export function handleErrorMessage(error) {
  let message;

  if (typeof error.response === 'undefined') {
    message = error.message;
  } else {
    if (error.response.status === 400) {
      message = 'Bad request, often due to missing a required parameter.';
    } else if (error.response.status === 401) {
      message = 'No valid API key provided.';
    } else if (error.response.status === 404) {
      message = 'The requested resource doesn\'t exist.';
    } else {
      message = 'Unknown error: ' + error.message;
    }
  }

  return message;
}

/**
 * Get album and artists data, then set it in firbase
 * @param {object} instance  Spotify axios instance
 * @param {integer} offset   Pagination offset
 * @param {integer} limit    Pagination limit
 * @param {object} db        Firebase connection
 * @param {function} onSuccess Success callback
 * @param {function} onError   Error callback
 */
export function setAlbumsAndArtists(instance, offset, limit, db, onSuccess, onError) {
  instance.get('/me/albums', {
    params: {
      limit: limit,
      offset: offset
    }
  })
    .then((response) => {
      fb.pushAlbums(response.data.items, db);
      fb.pushArtists(response.data.items, db);
      onSuccess();
    })
    .catch((error) => {
      let message = handleErrorMessage(error);
      onError(message);
    });

}


export function getProfile(instance, onSuccess, onError) {
  instance.get('/me')
    .then((response) => {
      onSuccess(response.data.id,  response.data.images[0].url);
    })
    .catch((error) => {
      let message = handleErrorMessage(error);
      onError(message);
    });
}

/**
 * Generates a random string containing numbers and letters
 * @param  {number} length The length of the string
 * @return {string} The generated string
 */
function generateRandomString(length) {
  let text = '';
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

  for (var i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
};
