import axios from 'axios';
import * as fb from './FirebaseHelper';
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
function getInstance(access_token) {
  return axios.create({
    baseURL: 'https://api.spotify.com/v1/',
    headers: { 'Authorization': 'Bearer ' + access_token }
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

  for (i = 0, j = arr.length; i < j; i += chunkLength) {
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

/************ ALBUM ***********/

/**
 * Extract album Spotify Id from spotify URI
 * @param  {String} s Spotify URI
 * @return {String}   Spotify ID
 */
function getSpotifyId(s) {
  return s.substring(14);
}

export function getAlbum(token, uri) {
  const albumId = getSpotifyId(uri);

  return getInstance(token)
    .get('/albums/' + albumId);

}

function getArtistsIds(items) {
  return fb.flatten(items.map((item) => item.album.artists.map((artist) => artist.id)));
}

/**
 * Get chunks of 50 albums from spotify, and save albums and artists to Firebase.
 * Loop over the different pages by calling the function recursively.
 * @param  {String} token  Spotify access token
 * @param  {number} offset Batch offset
 * @return {Promise}
 */
export function getAndSetUserSavedAlbums(token, offset) {

  return getUserSavedAlbumsChunk(token, offset)
    .then(({ data }) => {
      const arrayOfPromises = [
        fb.setAlbums(data.items.map((item) => fb.formatSpotifyAlbums(item)))
          .then(() => fb.updateOrSetArtistsFromAlbums(data.items, 'spotify'))
          .then(() => getArtistsImages(token, getArtistsIds(data.items), 'spotify'))
      ];

      // If there is a next page, push next promise to array
      if (data.next) { arrayOfPromises.push(getAndSetUserSavedAlbums(token, offset + 50)); }
      return Promise.all(arrayOfPromises);
    });

}

/**
 * Retrieve a batch of 50 albums from Spotify user's saved albums
 * @param  {String} token  Spotify access token
 * @param  {number} offset Batch offset (limit is 50)
 * @return {Promise}
 */
export function getAlbumsPage(token, offset) {
  return getInstance(token)
    .get('/me/albums', {
      params: {
        limit: 50,
        offset: offset
      }
    });
}


/********* PROFILE **********/

/**
 * Get Spotify user profile
 * @param {String} token     Access token
 * @param {function} onSuccess Success callback
 * @param {function} onError   Error callback
 */
export function getProfile(token) {

  return getInstance(token)
    .get('/me');

}


/******** ARTIST IMAGES  *********/

export function getArtistsImages(token, artistIds, source) {
  // Create batches of 50 ids
  const artistIdsChunks = splitArrayInChunks(artistIds, 50);

  const arrayOfImagePromises = artistIdsChunks.map((chunk) =>
    getArtistsChunk(token, chunk)
      .then((response) => fb.updateArtistsImages(formatArtistsImages(response.data.artists, source)))
  );

  return Promise.all(arrayOfImagePromises);
}


/**
 * Get artists for a list of artist ids < 50 items
 * @param  {string} token     Spotify API Token
 * @param  {array} artistIds  List of artist Ids
 * @return {Promise}
 */
function getArtistsChunk(token, artistIds) {
  return getInstance(token)
    .get('/artists', {
      params: {
        ids: artistIds.join(',')
      }
    });
}

/**
 * For a given artist object, return its first image url or returned
 * default image
 * @param  {object} artist Spotify Artist
 * @return {String}        Image url
 */
function getArtistImageUrl(artist) {
  if (artist.hasOwnProperty('images') && (artist.images.length > 0)) {
    return artist.images[0].url;
  }

  return '/static/images/missing.jpg';
}


/**
 * Format the response of getting artists to extract images
 * @param  {array} artists  List of Spotify Artists
 * @param  {String} source  Name of the source
 * @return {array}          List of object containing id and imgUrl of each artist
 */
function formatArtistsImages(artists, source) {
  return artists.map((artist) => {
    return {
      id: artist.id,
      source: source,
      imgUrl: getArtistImageUrl(artist)
    };
  });
}

export function getArtists(token, artistIds) {
  // Create batches of 50 ids
  const artistIdsChunks = splitArrayInChunks(artistIds, 50);

  return Promise.all(artistIdsChunks.map((chunk) => getArtistsChunk(token, chunk)));
}

