import axios from 'axios';
import * as fb from './FirebaseDataWrapper.js';

// Constants
const SPOTIFY_LOGIN_URL = 'https://accounts.spotify.com/authorize';
const STATE_KEY = 'spotify_auth_state';
const CLIENT_ID = '349fcdbe411c472eac393c9fdcc73b13';
const REDIRECT_URI = 'http://localhost:8888/#/callback';
const SCOPE = 'user-read-private user-read-email user-library-read';


/***** UTILS *****/

/**
 * For a given error, return a dedicated error message
 * @param  {object} error Error object
 * @return {string}       Error message
 */
function handleErrorMessage(error) {
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
function getInstance(access_token) {
  return axios.create({
    baseURL: 'https://api.spotify.com/v1/',
    timeout: 1000,
    headers: {'Authorization': 'Bearer ' + access_token}
  });
}

/**
 * Split a given array into chunks of a given length
 * @param  {array} arr   Array to split
 * @param  {int} chunkLength Length of a chunk
 * @return {array[array]}       array of array chunks
 */
function splitArrayInChunks(arr, chunkLength) {
  let i, j;
  let result = [];

  for (i = 0, j = arr.length; i < j; i+=chunkLength) {
    result.push(arr.slice(i, i + chunkLength));
  }

  return result;
}



/***** AUTHENTICATION *****/

/**
 * Get value of state in local storage
 * @return {string} Value of state
 */
function getStateKey() {
  return localStorage.getItem(STATE_KEY);
}


/**
 * Get value of state in local storage
 * @return {string} Value of state
 */
function removeStateKey() {
  localStorage.removeItem(STATE_KEY);
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
  while ( e = r.exec(q)) {
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



/***** FETCH USER ALBUMS AND ARTISTS *****/

/**
 * Get albums saved by user (batch of 50), then save it in firebase
 * @param {String} token     Access token
 * @param {integer} offset   Pagination offset
 * @param {integer} limit    Pagination limit
 * @param {function} onSuccess Success callback
 * @param {function} onError   Error callback
 */
export function setAlbumsThenArtists(token, offset, limit, onSuccess, onError) {

  getInstance(token)
    .get('/me/albums', {
      params: {
        limit: limit,
        offset: offset
      }
    })
    .then((response) => {
      fb.pushAlbums(response.data.items, onSuccess, onError, response.data.total, offset);
    })
    .catch((error) => {
      let message = handleErrorMessage(error);
      onError(message);
    });

}

/**
 * Get Spotify user profile
 * @param {String} token     Access token
 * @param {function} onSuccess Success callback
 * @param {function} onError   Error callback
 */
export function getProfile(token, onSuccess, onError) {

  getInstance(token)
    .get('/me')
    .then((response) => {
      onSuccess(response.data.id,  response.data.images[0].url);
    })
    .catch((error) => {
      let message = handleErrorMessage(error);
      onError(message);
    });

}


/**
 * Get artist Ids from Firebase, then fetch their image in Spotify
 * and update the artist in Firebase
 * @param {String} token     Access token
 * @param {function} onSuccess Success callback
 * @param {function} onError   Error callback
 */
export function getThenSetArtistImages(token, onSuccess, onError) {

  // Create /artist ref
  const db = fb.getFbDb();
  const ref = db.ref('artists');

  // Get artists ids stored in Firebase
  fb.getAllKeysThen(ref, (keys) => {

    // Create batches of 50 ids
    const artistIdsChunks = splitArrayInChunks(keys, 50);

    // Load first batch of images
    setImageChunk(ref, token, artistIdsChunks, 0, onSuccess, onError);
  });
}


/**
 * Fetch artists images for a chunk of artist Ids
 * @param {object} ref         firebase reference to /artists
 * @param {String} token     Access token
 * @param {array} artistIdsChunks   array of array of artist Ids
 * @param {int} chunkId     index of the artist ids chunk
 * @param {function} onSuccess Success callback
 * @param {function} onError   Error callback
 */
function setImageChunk(ref, token, artistIdsChunks, chunkId, onSuccess, onError) {

  getInstance(token)
    .get('/artists', {
      params: {
        ids: artistIdsChunks[chunkId].join(',')
      }
    })
    .then((response) => {

      // Get total number of chunks
      const totalChunks = artistIdsChunks.length;

      // Prepare updates object
      let updates = {};

      // Update image url value of artist and store in updates
      response.data.artists.forEach(function(artist) {
        updates['/' + artist.id + '/imgUrl'] = getArtistImageUrl(artist);
      });

      // Update artist image url in Firebase
      ref.update(updates)
        .then(() => {

          // If last chunk, call success callback, else, load next batch
          if (chunkId == totalChunks - 1) {
            onSuccess();
          } else {
            setImageChunk(ref, token, artistIdsChunks, chunkId + 1, onSuccess, onError);
          }
        });

    })
    .catch((error) => {
      onError('Something went wrong while pushing artist images.');
    });

}

/**
 * For a given artist object, return its first image url or returned
 * default image
 * @param  {object} artist Spotify Artist
 * @return {String}        Image url
 */
function getArtistImageUrl(artist) {
  let url = '';

  if (artist.hasOwnProperty('images') && (artist.images.length > 0)) {
    url = artist.images[0].url;
  } else {
    url = '/static/images/missing.jpg';
  }

  return url;
}


/****** CREATE ALBUM AND ARTISTS ******/

export function createAlbum(token, albumId, onSuccess, onError) {
  const db = fb.getFbDb();

  getInstance(token)
    .get('/albums/' + albumId)
    .then((response) => {
      fb.pushAlbum(response.data, db, onSuccess, onError);
    })
    .catch((error) => {
      let message = handleErrorMessage(error);
      onError(message);
    });

}
