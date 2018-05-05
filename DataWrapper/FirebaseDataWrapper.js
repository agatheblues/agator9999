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
    added_at,
    name,
    spotify,
    images,
    release_date
  }
);

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
    name,
    spotify,
    images,
    release_date
  });

let artistStructure = (
  {
    id,
    name,
    external_urls:  {spotify}
  }) => (
  {
    id,
    name,
    spotify
  });

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
 * CHeck if an item is in an array
 * @param  {array}  arr  Array to check
 * @param  {}  item Item to check if it belongs to array
 * @return {Boolean}      Return true if item is in array
 */
function isInArray(arr, item) {
  return (arr.indexOf(item) >= 0);
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



/****** PUSH DATA TO FIREBASE ******/

/**
 * For a given list of albums, push albums to Firebase, then their artists
 * @param  {Array} items          Array of Spotify Album
 * @param  {func} onSuccess       Success callback
 * @param  {func} onError         Error callback
 * @param  {integer} totalAlbums  Total albums in response
 * @param  {integer} offset       Offset pagination
 */
export function pushAlbums(items, onSuccess, onError, totalAlbums, offset) {

  // Convert list of albums to expected structure
  const albumsList = items.map(item => convertArtistOrAlbum(item, albumsStructure))
    .reduce((obj, item) => Object.assign({}, obj, item), {});

  // Create /albums ref
  const ref = getRef('albums');

  // Push new albums to DB, then push corresponding artists
  ref
    .update(albumsList)
    .then(() => { pushArtists(items, onSuccess, onError, totalAlbums, offset); })
    .catch((error) => {
      onError('Oops ! Something went wrong while pushing Albums to Firebase. ');
    });
}

/**
 * Format the array of array of artists send back by /me/albums
 * @param  {array} items Array of albums
 * @return {array}       Array of artists
 */
function formatArtists(items) {
  return items.map(item => item.album.artists.map(artist => convertArtistOrAlbum(artist, artistStructure)));
}


/**
 * Rename the key 'spotify' to 'url' and add a source key
 * @param  {object} item album or artist object
 * @return {object}      album or artist object with renamed and additionnal keys
 */
function formatObject(item) {
  let formatted = Object.keys(item).reduce((acc, key) => {
    // Rename spotify key
    let accKey = (key == 'spotify') ? 'url' : key;

    // Skip id key, else assign key
    if (key != 'id') { acc[accKey] = item[key]; }
    return acc;
  }, {});

  // Add source and albums
  formatted['source'] = 'spotify';

  return { [item.id]: formatted};
}

/**
 * Convert an artist object returned by spotify to the firebase expected artist or album object
 * @param  {object} item album or artist object from spotify
 * @return {object}      album or artist object with renamed url key + additional source field
 */
function convertArtistOrAlbum(item, destructuringRef) {
  return formatObject(destructuringRef(item));
}


/**
 * Convert an artist object returned by spotify to the firebase expected artist object
 * @param  {object} item artist object from spotify
 * @return {object}      artist object for DB: { id: {}}
 */

function setAlbumToArtist(artistId, albumId, totalTracks) {
  return { ['/' + artistId + '/albums/' + albumId]: { 'totalTracks': totalTracks }};
}


/**
 * Save artists to firebase
 * @param  {array} artists Array of artists
 * @return
 */
function pushArtists(items, onSuccess, onError, totalItems, offset) {

  // Create /artist ref
  const ref = getRef('artists');

  // Transform array to object with key = artist id
  const artistsList = flatten(formatArtists(items)).reduce((obj, item) => Object.assign({}, obj, item), {});

  // Prepare album list to update already existing + new artists
  const albumList = flatten(items.map(item => item.album.artists.map(artist => setAlbumToArtist(artist.id, item.album.id, item.album.tracks.total))))
    .reduce((obj, item) => Object.assign({}, obj, item), {});

  // Push new albums to DB
  ref.update(artistsList)
    .then(() => ref.update(albumList))
    .then(() => { onSuccess(totalItems, offset); })
    .catch((error) => {
      onError('Oops ! Something went wrong while adding artists to Firebase.');
    });
}


/**
 * Save a single album in Firebase
 * @param  {objet} item       Spotify Album
 * @param  {func} onSuccess   Success callback
 * @param  {func} onError     Error callback
 */
export function pushAlbum(item, images, onSuccess, onError) {

  // Convert album to expected structure
  const album = convertArtistOrAlbum(item, albumStructure);

  // Create /albums ref
  const ref = getRef('albums');

  // Get album Ids already in the db
  getAllKeysThen(ref, (keys) => {

    // Compare albums to those in the DB, extract only ids that are not there yet
    if (isInArray(keys, item.id)) {
      onError('Oops ! Album is already in your library.');
    } else {
      // Add album added date
      album[item.id]['added_at'] = Date.now();

      ref.update(album)
        .then(() => pushArtistsFromAlbum(item, images, onSuccess, onError))
        .catch((error) => onError('Oops ! Something went wrong while pushing the Album to Firebase. '));
    }
  });
}

/**
 * Save artists to firebase
 * @param  {array} artists Array of artists
 * @return
 */
function pushArtistsFromAlbum(item, images, onSuccess, onError) {

  // Create /artist ref
  const ref = getRef('artists');

  const arrayofpromises = item.artists.map((artistData) => {
    const artist = convertArtistOrAlbum(artistData, artistStructure);
    const artistId = Object.keys(artist)[0];

    function mightUpdateArtist(snapshot) {
      if (!snapshot.val()) { return true; /* did not update */ }

      ref.update(setAlbumToArtist(artistId, item.id, item.tracks.total));
    }

    function mightSetArtist(didNotUpdate) {
      // Add album to artist object and artist image
      artist[artistId]['albums'] = { [item.id]: {'totalTracks': item.tracks.total} };
      artist[artistId]['imgUrl'] = images[artistId];

      if (!didNotUpdate) { return; /* already updated */ }

      ref.child(artistId)
        .set(artist[artistId]);
    }

    // If artist exists, update else create new.
    return ref.child(artistId)
      .once('value')
      .then(mightUpdateArtist)
      .then(mightSetArtist)
      .catch((error) => {
        onError('Oops ! Something went wrong while setting/updating an artist in Firebase.');
      });
  });

  Promise.all(arrayofpromises)
    .then(() => onSuccess());
}


/******** GET DATA FROM FIREBASE *******/

/**
 * Get list of all artists stored in Firebase
 * @param  {func} onSuccess Handle success callback
 */
export function getArtists(onSuccess, onError) {

  // Create /artist ref
  const ref = getRef('artists');

  let artists = [];

  ref.once('value')
    .then((data) => {
      data.forEach(function(item) {
        let artist = item.val();
        artist['id'] = item.key;
        artists.push(artist);
      });

      onSuccess(artists);
    })
    .catch(() => onError());

}


/**
 * Get a single artist from FB
 * @param  {string} id        Artist id
 * @param  {func} onSuccess   Success callback
 * @param  {func} onError     Error callback
 * @return
 */
export function getArtist(id, onSuccess, onError) {

  // Create /artist ref
  const ref = getRef('artists/' + id);

  ref.once('value')
    .then(function(snapshot) {
      let artist = snapshot.val();

      // Update albums structure in artist object
      artist.albums = objectToArray(artist.albums);

      onSuccess(artist);
    })
    .catch((errorObject) => { onError('Something went wrong while getting artist data! ' + errorObject.code);});

}


/**
 * Get a single album from FB
 * @param  {string} id        Album id
 * @param  {func} onSuccess   Success callback
 * @param  {func} onError     Error callback
 * @return
 */
export function getAlbum(id, onSuccess, onError) {

  // Create /album ref
  const ref = getRef('albums/' + id);

  ref.once('value')
    .then(function(snapshot) {
      let album = snapshot.val();

      onSuccess(album);
    })
    .catch((errorObject) => {
      onError('Something went wrong! ' + errorObject.code);
    });

}
