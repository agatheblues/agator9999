import axios from 'axios';
import firebase from 'firebase';
import config from '../config.json';

let albumsStructure = (
  {
    added_at,
    album: {
      id,
      name,
      external_urls:  {spotify},
      images,
      release_date
    }
  }) => (
  {
    id,
    albumData: {
      added_at,
      name,
      spotify,
      images,
      release_date
    }
  });

let albumStructure = (
  {
    id,
    name,
    external_urls:  {spotify},
    images,
    release_date
  }) => (
  {
    id,
    albumData: {
      name,
      spotify,
      images,
      release_date
    }
  });

let artistStructure = (
  {
    id,
    name,
    external_urls:  {spotify}
  }) => (
  {
    id,
    artistData: {
      name,
      spotify
    }
  });


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


export function pushAlbums(items) {

  // Get db
  const db = getFbDb();

  // Flatten the array of albums
  const albums = items.map(item => convertToAlbumsFromSpotify(item));

  // Create /albums ref
  const ref = db.ref('albums');

  // Get album Ids already in the db
  getAllKeysThen(ref, (keys) => {
    // Compare albums to those in the DB, extract only ids that are not there yet
    const newAlbums = albums.filter(album => !isInArray(keys, album.id));

    // Push new albums to DB
    newAlbums.forEach(album => ref.child(album.id).set(album.albumData));
  });

}



export function pushAlbum(item, onError) {

  // Get db
  const db = getFbDb();

  // Flatten the array of albums
  const album = convertToAlbumFromSpotify(item);

  // Create /albums ref
  const ref = db.ref('albums');

  // Get album Ids already in the db
  getAllKeysThen(ref, (keys) => {

    // Compare albums to those in the DB, extract only ids that are not there yet
    if (isInArray(keys, album.id)) {

      onError('Oops ! Album is already in your library.');

    } else {

      // Save album in DB
      ref.child(album.id).set(album.albumData);

      // Flatten the array of artists
      const artists = flatten(item.artists.map(artist => convertToArtistFromSpotify(artist, item.id, item.tracks.total)));

      // Push artists for real
      pushArtists(artists);
    }
  });
}


/**
 * Format the array of array of artists send back by /me/albums
 * @param  {array} items Array of albums
 * @return {array}       Array of artists
 */
export function formatArtists(items) {
  return flatten(items.map(item => item.album.artists.map(artist => convertToArtistFromSpotify(artist, item.album.id, item.album.tracks.total))));
}


/**
 * Save artists to firebase
 * @param  {array} artists Array of artists
 * @return
 */
export function pushArtists(artists) {

  // Get db
  const db = getFbDb();

  // Create /artist ref
  const ref = db.ref('artists');

  // Get artists Ids already in the db
  getAllKeysThen(ref, (keys) => {

    // Compare artists to those in the DB, extract only ids that are not there yet
    const newArtists = artists.filter(artist => !isInArray(keys, artist.id));

    // Push new artists to DB
    newArtists.forEach(artist => ref.child(artist.id).set(artist.artistData));

    // Get artists in the DB and add the album
    const updateArtists = artists.filter(artist => isInArray(keys, artist.id));

    // Update albums of artist which are already in the DB
    updateArtists.forEach(artist => addAlbumToArtist(ref, artist));
  });
}


// TODO: Add onError
export function getArtists(onSuccess) {

  // Get db
  const db = getFbDb();

  // Create /artist ref
  const ref = db.ref('artists');

  let artists = [];

  ref.on('value', function(data) {
    data.forEach(function(item) {
      let artist = item.val();
      artist['id'] = item.key;
      artists.push(artist);
    });

    onSuccess(artists);
  }, function (errorObject) {
    console.log('The read failed: ' + errorObject.code);
  });

}


/**
 * Get artist from FB
 * @param  {string} id        Artist id
 * @param  {func} onSuccess   Success callback
 * @param  {func} onError     Error callback
 * @return
 */
export function getArtist(id, onSuccess, onError) {

  // Get db
  const db = getFbDb();

  // Create /artist ref
  const ref = db.ref('artists/' + id);

  ref.once('value').then(function(snapshot) {
    let artist = snapshot.val();

    // Update albums structure in artist object
    artist.albums = objectToArray(artist.albums);

    onSuccess(artist);
  }, function (errorObject) {
    onError('Something went wrong while getting artist data! ' + errorObject.code);
  });

}


/**
 * Get album from FB
 * @param  {string} id        Album id
 * @param  {func} onSuccess   Success callback
 * @param  {func} onError     Error callback
 * @return
 */
export function getAlbum(id, onSuccess, onError) {

  // Get db
  const db = getFbDb();

  // Create /album ref
  const ref = db.ref('albums/' + id);

  ref.once('value').then(function(snapshot) {
    let album = snapshot.val();

    onSuccess(album);
  }, function (errorObject) {
    onError('Something went wrong! ' + errorObject.code);
  });

}

/**
 * Get all key names of first level of data
 * @param  {ref} ref Reference to a db path
 * @return {array}     array of keys
 */
export function getAllKeysThen(ref, doThis) {

  ref.once('value', function(snapshot) {
    let keys = [];
    snapshot.forEach(function(key) {
      keys.push(key.key);
    });
    doThis(keys);
  });
}


/**
 * CHeck if an item is in an array
 * @param  {array}  arr  Array to check
 * @param  {}  item Item to check if it belongs to array
 * @return {Boolean}      Return true if item is in array
 */
function isInArray(arr, item) {
  return (arr.indexOf(item) >= 0);
}

/**
 * Convert an album object returned by spotify to a simpler album object
 * @param  {object} item album object from spotify
 * @return {object}      album object for DB
 */
function convertToAlbumsFromSpotify(item) {
  let album = albumsStructure(item);
  album['albumData'] = renameSpotifyKeyToUrl(album['albumData']);
  return album;
}

/**
 * Convert an album object returned by spotify to a simpler album object
 * @param  {object} item album object from spotify
 * @return {object}      album object for DB
 */
function convertToAlbumFromSpotify(item) {
  let album = albumStructure(item);
  album['albumData'] = renameSpotifyKeyToUrl(album['albumData']);
  album['albumData']['added_at'] = Date.now();
  return album;
}


/**
 * Convert an artist object returned by spotify to a simpler artist object
 * @param  {object} item artist object from spotify
 * @return {object}      artist object for DB
 */
function convertToArtistFromSpotify(item, albumId, totalTracks) {
  let artist = artistStructure(item);

  // Add album key
  let album = {};
  album[albumId] = { 'totalTracks': totalTracks };
  artist['artistData']['albums'] = album;

  artist['artistData'] = renameSpotifyKeyToUrl(artist['artistData']);
  return artist;
}


/**
 * Rename the key 'spotify' to 'url' and a source key
 * @param  {object} item album or artist object
 * @return {object}      album or artist object with renamed and additionnal keys
 */
function renameSpotifyKeyToUrl(item) {
  let mapped = Object.keys(item).reduce((acc, key) => {
    let accKey = (key == 'spotify') ? 'url' : key;
    acc[accKey] = item[key];
    return acc;
  }, {});

  mapped['source'] = 'spotify';
  return mapped;
}


/**
 * Add an album to the list of albums of an artist
 * @param {object} ref    firebase db ref to artist node
 * @param {object} artist artist object containing the albums
 */
function addAlbumToArtist(ref, artist) {
  var updates = {};
  let albumId, totalTracks;

  if (artist.hasOwnProperty('artistData') && artist.artistData.hasOwnProperty('albums') &&  Object.keys(artist.artistData.albums).length != 0) {
    albumId = Object.keys(artist.artistData.albums)[0];
    totalTracks = artist.artistData.albums[albumId];
  }

  updates['/' + artist.id + '/albums/' + albumId] = totalTracks;
  ref.update(updates);
}

/**
 * Flattens an array
 * @param  {array} arr Array of arrays
 * @return {array}     Array
 */
function flatten(arr) {
  return arr.reduce(function (flat, toFlatten) {
    return flat.concat(Array.isArray(toFlatten) ? flatten(toFlatten) : toFlatten);
  }, []);
}


function objectToArray(item) {
  return Object.keys(item).reduce((acc, key) => {
    acc.push(Object.assign({id: key}, item[key]));
    return acc;
  }, []);
}
