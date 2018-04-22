import axios from 'axios';
import * as fb from './FirebaseDataWrapper.js';

// Constants
const SPOTIFY_LOGIN_URL = 'https://accounts.spotify.com/authorize';
const STATE_KEY = 'spotify_auth_state';
const CLIENT_ID = '349fcdbe411c472eac393c9fdcc73b13';
const REDIRECT_URI = 'http://localhost:8888/#/callback';
const SCOPE = 'user-read-private user-read-email user-library-read';

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
    setAccessToken(accessToken, expiresIn);
    window.location = '/#/' + storedState;
  }

  removeStateKey();
}

/**
 * Obtains parameters from the hash of the URL
 * @return Object
 */
export function getHashParams() {
  let hashParams = {};
  let e, r = /([^&;=]+)=?([^&;]*)/g,
    q = window.location.hash.substring(2);
  while ( e = r.exec(q)) {
    hashParams[e[1]] = decodeURIComponent(e[2]);
  }
  return hashParams;
}

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
 * Get album and artists data, then set it in firbase
 * @param {object} instance  Spotify axios instance
 * @param {integer} offset   Pagination offset
 * @param {integer} limit    Pagination limit
 * @param {object} db        Firebase connection
 * @param {function} onSuccess Success callback
 * @param {function} onError   Error callback
 */
export function setAlbumsAndArtists(token, offset, limit, onSuccess, onError) {

  getInstance(token)
    .get('/me/albums', {
      params: {
        limit: limit,
        offset: offset
      }
    })
    .then((response) => {
      fb.pushAlbums(response.data.items);
      fb.pushArtists(fb.formatArtists(response.data.items));

      onSuccess(response.data.next, response.data.total, offset);
    })
    .catch((error) => {
      let message = handleErrorMessage(error);
      onError(message);
    });

}

/**
 * Get Spotify user profile
 * @param {object} instance  Spotify axios instance
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
 * Get artist images from the artists stored in firebase
 * @param {object} instance  Spotify axios instance
 * @param {object} db        Firebase connection
 * @param {function} onSuccess Success callback
 * @param {function} onError   Error callback
 */
export function getArtistImages(token, onSuccess, onError) {
  const db = fb.getFbDb();

  // Create /artist ref
  const ref = db.ref('artists');

  //TODO Only get keys without imgUrl key
  // Get artists Ids already in the db
  fb.getAllKeysThen(ref, (keys) => {
    // Create batches of 50 ids
    const artistIdsChunk = splitArrayInChunks(keys, 50);
    const total = artistIdsChunk.length;

    // For each batch, load images
    artistIdsChunk.forEach((chunk, index) => setImages(ref, token, chunk, index, total, onSuccess, onError));
  });
}


/**
 * Fetch artists images for a chunk of artist Ids
 * @param {object} ref         firebase reference to /artists
 * @param {object} instance  Spotify axios instance
 * @param {array} artistIds   array of artist Ids
 * @param {int} chunkId     index of the artist ids chunk
 * @param {int} totalChunks total number of chunks for which we want to fetch images
 * @param {function} onSuccess Success callback
 * @param {function} onError   Error callback
 */
function setImages(ref, token, artistIds, chunkId, totalChunks, onSuccess, onError) {

  getInstance(token)
    .get('/artists', {
      params: {
        ids: artistIds.join(',')
      }
    })
    .then((response) => {

      // Update image url value of artist
      response.data.artists.forEach(function(artist) {

        var updates = {};
        let url = '';

        if (artist.hasOwnProperty('images') && (artist.images.length > 0)) {
          url = artist.images[0].url;
        } else {
          url = '/static/images/missing.jpg';
        }

        updates['/' + artist.id + '/imgUrl'] = url;
        ref.update(updates);
      });

      // If last chunk, call success callback
      if (chunkId == totalChunks - 1) {
        onSuccess();
      }
    })
    .catch((error) => {
      let message = handleErrorMessage(error);
      onError(message);
    });

}



export function createAlbum(token, albumId, onSuccess, onError) {
  const db = fb.getFbDb();

  getInstance(token)
    .get('/albums/' + albumId)
    .then((response) => {
      fb.pushAlbum(response.data, db, onError);
      onSuccess('Album successfully added...');
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
