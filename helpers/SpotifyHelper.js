import axios from 'axios';
import axiosRetry from 'axios-retry';
import { splitArrayInChunks } from './utils';
import { spotifyConfig } from '../config';


/***** UTILS *****/

/**
 * For a given error, return a dedicated error message
 * @param  {object} error Error object
 * @return {string}       Error message
 */
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
 * Create axios instance for Spotify API requests
 * @param  {string} access_token Spotify API Access token retrieved after login
 * @return {func}              Axios instance
 */
function getInstance(access_token, retry = false) {
  const client = axios.create({
    baseURL: 'https://api.spotify.com/v1/',
    headers: { 'Authorization': 'Bearer ' + access_token }
  });

  if (!retry) return client;

  axiosRetry(client, {
    retryCondition: e => e.code === 429,
    retryDelay: axiosRetry.exponentialBackoff,
  });

  return client;
}

/***** AUTHENTICATION *****/

/**
 * Get value of state in local storage
 * @return {string} Value of state
 */
function getStateKey() {
  return localStorage.getItem(spotifyConfig.STATE_KEY);
}

/**
 * Get value of state in local storage
 * @return {string} Value of state
 */
function removeStateKey() {
  localStorage.removeItem(spotifyConfig.STATE_KEY);
}

/**
 * Set value of token in local storage
 */
function setAccessToken(token, expiresIn) {
  localStorage.setItem('token_end_date', Date.now() + parseInt(expiresIn));
  localStorage.setItem('access_token', token);
}

/**
 * remove values related to token from local storage
 * @return {string} Value of token
 */
function removeAccessToken() {
  localStorage.removeItem('access_token');
  localStorage.removeItem('token_end_date');
}

/**
 * Obtains parameters from the hash of the URL
 * @return Object
 */
function getHashParams() {
  let hashParams = {};
  let e, r = /([^&;=]+)=?([^&;]*)/g,
    q = window.location.hash.substring(2);
  while (e = r.exec(q)) {
    hashParams[e[1]] = decodeURIComponent(e[2]);
  }
  return hashParams;
}

/**
 * Get value of token in local storage
 * @return {string} Value of token
 */
export function getAccessToken() {
  const token = localStorage.getItem('access_token');
  const tokenDate = parseInt(localStorage.getItem('token_end_date'));
  const now = Date.now();

  if ((now > tokenDate)) {
    removeAccessToken();
    return null;
  }

  return token;
}

/**
 * Build URL to login authentication
 * @return {string} URL
 */
export function getLoginUrl(redirectTo) {
  const urlState = redirectTo;

  localStorage.setItem(spotifyConfig.STATE_KEY, urlState);
  let url = spotifyConfig.SPOTIFY_LOGIN_URL;

  url += '?response_type=token';
  url += '&client_id=' + encodeURIComponent(spotifyConfig.CLIENT_ID);
  url += '&scope=' + encodeURIComponent(spotifyConfig.SCOPE);
  url += '&redirect_uri=' + encodeURIComponent(spotifyConfig.REDIRECT_URI);
  url += '&state=' + encodeURIComponent(urlState);

  return url;
}

/**
 * Authentication flow
 * @param  {function} onError handles error
 */
export function authenticate(onError) {
  const storedState = getStateKey();

  // URL dependencies
  const params = getHashParams();
  const accessToken = params.access_token;
  const urlState = params.state;
  const expiresIn = params.expires_in * 1000; //ms

  if (accessToken && (urlState == null || urlState !== storedState)) {
    onError('There was an error during the authentication');
  } else if (accessToken && expiresIn && storedState) {

    // Save access token and expiration date in local storage
    setAccessToken(accessToken, expiresIn);

    // Redirect to component route stored in state
    window.location = '/#/' + storedState;
  }

  // Remove state key from storage to prevent side effects
  removeStateKey();
}

/************ RESOURCES ***********/

/**
 * Retrieve one album given its Spotify URI
 * @param {String} token 
 * @param {String} uri 
 */
export const getAlbum = (token, uri) => getInstance(token).get('/albums/' + getSpotifyId(uri));

/**
 * Retrieve a batch of albums from Spotify user's saved albums
 * @param  {String} token  Spotify access token
 * @param  {number} offset Batch offset
 * @param  {number} limit  Items per batch (max is 50)
 * @return {Promise}
 */
export const getAlbumsPage = (token, offset, limit) => getInstance(token, true).get('/me/albums', {
  params: {
    limit: limit,
    offset: offset
  }
});

/**
 * Get Spotify user profile
 * @param {String} token     Access token
 * @param {function} onSuccess Success callback
 * @param {function} onError   Error callback
 */
export const getProfile = (token) => getInstance(token).get('/me');

/**
 * Returns an array of promises, from the pagination of the retrieval
 * of the required artistIds
 * @param {String} token  Spotify access token
 * @param {Array} artistIds List of desired artist ids
 * @param {Number} limit    Items per batch (max is 50)
 */
export function getArtists(token, artistIds, limit = 50) {
  const chunks = splitArrayInChunks(artistIds, limit);
  return Promise.all(chunks.map((chunk) => getArtistsPage(token, chunk)));
}

/**
 * Extract album Spotify Id from spotify URI
 * @param  {String} s Spotify URI
 * @return {String}   Spotify ID
 */
const getSpotifyId = (s) => {
  return s.substring(14);
}

/**
 * Get artists for a list of artist ids < 50 items
 * @param  {string} token     Spotify API Token
 * @param  {array} artistIds  List of artist Ids
 * @return {Promise}
 */
const getArtistsPage = (token, artistIds) => getInstance(token).get('/artists', {
  params: {
    ids: artistIds.join(',')
  }
});