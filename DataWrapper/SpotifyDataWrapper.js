import axios from 'axios';

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
