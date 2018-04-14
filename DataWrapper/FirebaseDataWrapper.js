import axios from 'axios';
import firebase from 'firebase';
import config from '../config.json';

let albumStructure = (
  {
    added_at,
    album: {
      id,
      name,
      external_urls:  {spotify},
      images
    }
  }) => (
  {
    id,
    albumData: {
      added_at,
      name,
      spotify,
      images
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


export function pushAlbums(items, db) {

  // Flatten the array of albums
  const albums = items.map(item => convertToAlbumFromSpotify(item));

  // Create /albums ref
  const ref = db.ref('albums');

  // Get album Ids already in the db
  const albumIdsAlreadyInDb = getAllKeys(ref);

  // Compare albums to those in the DB, extract only ids that are not there yet
  const newAlbums = albums.filter(album => !isInArray(albumIdsAlreadyInDb, album.id));

  if (newAlbums.length == 0) {
    return;
  }

  // Push new albums to DB
  newAlbums.forEach(album => ref.child(album.id).set(album.albumData));

}




export function pushArtists(items, db) {

  // Flatten the array of artists
  const artists = flatten(items.map(item => item.album.artists.map(artist => convertToArtistFromSpotify(artist, item.album.id, item.album.tracks.total))));

  // Create /artist ref
  const ref = db.ref('artists');

  // Get artists Ids already in the db
  const artistIdsInDb = getAllKeys(ref);

  // Compare artists to those in the DB, extract only ids that are not there yet
  const newArtists = artists.filter(artist => !isInArray(artistIdsInDb, artist.id));

  // Push new artists to DB
  newArtists.forEach(artist => ref.child(artist.id).set(artist.artistData));

  // Get artists in the DB and add the album
  const updateArtists = artists.filter(artist => isInArray(artistIdsInDb, artist.id));

  // Update albums of artist which are already in the DB
  updateArtists.forEach(artist => addAlbumToArtist(ref, artist));
}


// TODO: Add onError
export function getArtists(db, onSuccess) {
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



export function getArtist(id, db, onSuccess, onError) {
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


export function getAlbum(id, db, onSuccess, onError) {
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
export function getAllKeys(ref) {
  var keys = [];

  ref.on('value', function(snapshot) {
    snapshot.forEach(function(key) {
      keys.push(key.key);
    });
  });

  return keys;
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
function convertToAlbumFromSpotify(item) {
  let album = albumStructure(item);
  album['albumData'] = renameSpotifyKeyToUrl(album['albumData']);
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
