import axios from 'axios';
import firebase from 'firebase';
import config from '../firebase.config.json';


/******* FORMATTING *******/

export const formatAlbums = ({ added_at, album }) => (
  {
    added_at,
    ...formatAlbum(album)
  }
);

export const formatAlbum = ({ id, name, external_urls: { spotify }, images, release_date }) => (
  {
    id,
    name,
    url: spotify,
    images,
    release_date,
    source: 'spotify'
  });

export const formatAlbumSummary = ({ added_at, album: { id, tracks: { total }}}) => (
  {
    id,
    added_at,
    tracks: { total }
  });

export const formatSingleAlbumSummary = ({ id, tracks: { total }}) => (
  {
    id,
    tracks: { total }
  });

const formatArtist = ({ id, name, external_urls: { spotify } }) => (
  {
    id,
    name,
    url: spotify,
    source: 'spotify'
  });

/**
 * Format the array of array of artists send back by /me/albums
 * @param  {array} items Array of albums
 * @return {array}       Array of artists
 */
export function formatArtists(artists) {
  return artists.map(artist => formatArtist(artist));
}


/**
 * Converts an album list object {id: {totalTracks}} to an array of albums
 * [{id, totalTracks}]
 * @param  {object} item Album list object
 * @return {array}       Array of ids
 */
export function convertAlbumSummaryToArray(item) {

  return Object.keys(item).reduce((acc, key) => {
    acc.push(Object.assign({id: key}, item[key]));
    return acc;
  }, []);

}



/******* UTILS *******/

/**
 * Initialize Firebase app
 */
function init() {
  if (firebase.apps.length) {
    return;
  }
  firebase.initializeApp(config);
}


/**
 * Get firebase database reference
 * @return {Object} FB database ref
 */
export function getFbDb() {
  init();
  return firebase.database();
}


/**
 * Get Firebase ref
 * @param  {String} path Path to ref
 * @return {object}      Firebase ref
 */
function getRef(path) {
  return getFbDb().ref(path);
}

/**
 * Flattens an array
 * @param  {array} arr Array of arrays
 * @return {array}     Array
 */
export function flatten(arr) {
  return arr.reduce(function (flat, toFlatten) {
    return flat.concat(Array.isArray(toFlatten) ? flatten(toFlatten) : toFlatten);
  }, []);
}


/**
 * Omits given keys in object
 * @param  {array} keys   Array of keys to omit
 * @param  {object} obj   Object to omit keys of
 * @return {object}      Object with omitted keys
 */
function omit(keys, obj) {
  return Object.keys(obj)
    .reduce((acc, currentValue) => {
      if (keys.indexOf(currentValue) < 0) acc[currentValue] = obj[currentValue];
      return acc;
    }, {});
}


/******** ARTISTS *******/

/**
 * Convert an artist object returned by spotify to the firebase expected artist object
 * @param  {object} item artist object from spotify
 * @return {object}      artist object for DB: { id: {}}
 */

export function updateOrSetArtistsFromAlbums(items) {
  return Promise.all(items.map((item) => updateOrSetArtistsFromSingleAlbum(formatArtists(item.album.artists), formatAlbumSummary(item))));
}

/**
 * If artists already exist in Firebase, update their album list
 * else, set new artists
 * @param  {object} artists List of Firebase artist object
 * @param  {object} album   Firebase album object
 * @return {Promise}
 */
export function updateOrSetArtistsFromSingleAlbum(artists, album) {
  return Promise.all(artists.map((artist) => updateOrSetSingleArtistFromSingleAlbum(artist, album)));
}


/**
 * If artist already exists in Firebase, update its album list
 * else, set new artist
 * @param  {object} artist Firebase artist object
 * @param  {object} album  Firebase album object
 * @return {Promise}
 */
function updateOrSetSingleArtistFromSingleAlbum(artist, album) {

  function mightUpdateArtist(snapshot) {
    if (!snapshot.exists()) { return true; /* did not update */ }
    updateArtistAlbumsList(artist, album);
  }

  function mightSetArtist(didNotUpdate) {
    if (!didNotUpdate) { return; /* already updated */ }
    setArtist(addFirstAlbumToArtist(artist, album));
  }

  if (!album.hasOwnProperty('added_at')) {
    // Add album added date
    album.added_at = new Date().toUTCString();
  }

  return getArtist(artist.id)
    .then(mightUpdateArtist)
    .then(mightSetArtist);
}


/**
 * Update album property in artist object by adding a new album to the list
 * @param  {object} artist Firebase artist object
 * @param  {object} album  Firebase album object
 * @return {Promise}
 */
function updateArtistAlbumsList(artist, album) {
  return getRef('artists')
    .update({
      ['/' + artist.id + '/albums/' + album.id]: {
        'totalTracks': album.tracks.total,
        'added_at': album.added_at
      },
    });
}

/**
 * Sets an artist to Firebase
 * @param {object} artist Firebase artist object
 * @return {Promise}
 */
function setArtist(artist) {
  return getRef('artists')
    .child(artist.id)
    .set(omit(['id'], artist));
}


/**
 * Add the album property to the artist object
 * @param {object} artist Firebase artist object
 * @param {object} album  Firebase album object
 * @return {object}       Firebase artist object
 */
function addFirstAlbumToArtist(artist, album) {
  artist['albums'] = {
    [album.id]: {
      'totalTracks': album.tracks.total,
      'added_at': album.added_at
    }
  };
  return artist;
}


/**
 * Get a single artist from FB
 * @param  {string} id        Artist id
 * @return {Promise}
 */
export function getArtist(id) {

  return getRef('artists/' + id)
    .once('value');

}


/**
 * Get list of all artists stored in Firebase
 * @return {Promise}
 */
export function getArtists() {

  return getRef('artists')
    .once('value');

}



/********** ALBUMS *********/

/**
 * Save a single album in Firebase
 * @param  {objet} item       Spotify Album
 */
function setAlbum(album) {
  if (!album.hasOwnProperty('added_at')) {
    // Add album added date
    album.added_at = new Date().toUTCString();
  }

  return getRef('albums')
    .child(album.id)
    .set(omit(['id'], album));
}

/**
 * If artists already exist in Firebase, update their album list
 * else, set new artists
 * @param  {object} artists List of Firebase artist object
 * @param  {object} album   Firebase album object
 * @return {Promise}
 */
export function setAlbums(albums) {
  return Promise.all(flatten(albums.map((album) => setAlbum(album))));
}

export function setAlbumIfNotExists(album) {
  return getAlbum(album.id)
    .then((snapshot) => {
      if (snapshot.exists()) { throw({ message : 'Oops! This album is already in your library!'});}
      setAlbum(album);
    });
}


/**
 * Get a single album from FB
 * @param  {string} id        Album id
 * @return {Promise}
 */
export function getAlbum(id) {

  return getRef('albums/' + id)
    .once('value');

}


/**
 * Get list of all albums stored in firebase
 * @return {Promise}
 */
export function getAlbums() {

  return getRef('albums')
    .once('value');

}

/********* ARTIST IMAGES ******/

/**
 * If artists do not exists, set the artists with the imgUrl property.
 * Else, update the imgUrl property.
 * @param  {array} images   Array of object which contains artist id and imgUrl
 * @return {Promise}
 */
export function updateArtistsImages(images) {
  return Promise.all(images.map((image) => updateASingleArtistImage(image)));
}


/**
 * If artist does not exists, set the artist with the imgUrl property.
 * Else, update the imgUrl property.
 * @param  {object} image   Contains artist id and imgUrl
 * @return {Promise}
 */
function updateASingleArtistImage(image) {

  return getArtist(image.id)
    .then(updateArtistImage(image));
}


/**
 * Update artist imgUrl property
 * @param  {object} image Contains artist id and imgUrl
 * @return {Promise}
 */
function updateArtistImage(image) {
  return getRef('artists')
    .update({
      ['/' + image.id + '/imgUrl/']: image.imgUrl
    });
}
