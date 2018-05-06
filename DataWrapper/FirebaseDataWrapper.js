import axios from 'axios';
import firebase from 'firebase';
import config from '../config.json';

let albumsStructure = (
  {
    added_at,
    album
  }) => (
  {
    [album.id]: {
      added_at,
      ...formatAlbum(album)[album.id]
    }
  }
);

export const formatAlbum = (
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
    url: spotify,
    images,
    release_date,
    source: 'spotify'
  });

export const formatAlbumSummary = (
  {
    id,
    tracks: { total }
  }) => (
  {
    id,
    tracks: { total }
  });

const formatArtist = (
  {
    id,
    name,
    external_urls:  {spotify}
  }) => (
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

  // Create /albums ref
  const ref = getRef('albums');

  // Array of promises of album set in FB
  const arrayofpromises = items.map((albumData) => {
    const album = convertToStructure(albumData, albumsStructure);
    const albumId = Object.keys(album)[0];

    return ref.child(albumId)
      .once('value')
      .then((snapshot) => {
        if (snapshot.exists()) { console.log('album already exists'); return;}

        ref.child(albumId)
          .set(album[albumId]);
      })
      .catch((error) => {
        onError('Oops ! Something went wrong while pushing Albums to Firebase. ');
      });
  });

  Promise.all(arrayofpromises)
    .then(() => {console.log('terminadoooo album'); pushArtists(items, onSuccess, onError, totalAlbums, offset);});
}






// /**
//  * Convert an artist object returned by spotify to the firebase expected artist or album object
//  * @param  {object} item album or artist object from spotify
//  * @return {object}      album or artist object with renamed url key + additional source field
//  */
// export function convertToStructure(item, destructuringRef) {
//   return formatObject(destructuringRef(item));
// }


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

  const arrayofpromises = flatten(items.map((item) => {
    const albumId = item.album.id;
    const albumTotalTracks = item.album.tracks.total;

    return item.album.artists.map((artistData) => updateOrSetArtist(ref, artistData, albumId, albumTotalTracks));
  }));

  Promise.all(arrayofpromises)
    .then(() => {console.log('done pushing artist'); onSuccess(totalItems, offset);});
}


export function updateOrSetArtists(artists, albumData) {
  return Promise.all(artists.map((artist) => updateOrSetASingleArtist(artist, albumData)));
}


function updateOrSetASingleArtist(artist, album) {
  console.log(artist, album);

  function mightUpdateArtist(snapshot) {
    if (!snapshot.exists()) { return true; /* did not update */ }
    updateArtistAlbumsList(artist, album);
  }

  function mightSetArtist(didNotUpdate) {
    if (!didNotUpdate) { return; /* already updated */ }
    setArtist(addFirstAlbumToArtist(artist, album));
  }

  // If artist exists, update else create new.
  return getArtist(artist.id)
    .then(mightUpdateArtist)
    .then(mightSetArtist);
}

function updateArtistAlbumsList(artist, album) {
  return getRef('artists')
    .update({
      ['/' + artist.id + '/albums/' + album.id]: { 'totalTracks': album.tracks.total }
    });
}

function setArtist(artist) {
  return getRef('artists')
    .child(artist.id)
    .set(omit(['id'], artist));
}

function addFirstAlbumToArtist(artist, album) {
  artist['albums'] = { [album.id]: {'totalTracks': album.tracks.total} };
  return artist;
}

/**
 * Save a single album in Firebase
 * @param  {objet} item       Spotify Album
 */
function setAlbum(album) {
  // Add album added date
  album['added_at'] = Date.now();

  // Set album
  return getRef('albums')
    .child(album.id)
    .set(omit(['id'], album));
}


export function setAlbumIfNotExists(album) {
  return getAlbum(album.id)
    .then((snapshot) => {
      if (snapshot.exists()) { throw('Oops! This album is already in your library!');}
      setAlbum(album);
    });
}

/**
 * Save artists to firebase
 * @param  {array} artists Array of artists
 * @return
 */
function pushArtistsFromAlbum(item, images, onSuccess, onError) {
  console.log('item', item);
  // Create /artist ref
  const ref = getRef('artists');

  const arrayofpromises = item.artists.map((artistData) => {
    const artist = convertToStructure(artistData, artistStructure);
    const artistId = Object.keys(artist)[0];

    function mightUpdateArtist(snapshot) {
      if (!snapshot.exists()) { return true; /* did not update */ }
      console.log('update', artistId);
      ref.update(setAlbumToArtist(artistId, item.id, item.tracks.total));
    }

    function mightSetArtist(didNotUpdate) {
      if (!didNotUpdate) { return; /* already updated */ }
      console.log('set', artistId);
      // Add album to artist object and artist image
      artist[artistId]['albums'] = { [item.id]: {'totalTracks': item.tracks.total} };
      if (images) { artist[artistId]['imgUrl'] = images[artistId]; };

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

  console.log(arrayofpromises);
  Promise.all(arrayofpromises)
    .then(() => { onSuccess(); });
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
 * @return
 */
export function getArtist(id) {

  return getRef('artists/' + id)
    .once('value');

}


/**
 * Get a single album from FB
 * @param  {string} id        Album id
 * @return
 */
export function getAlbum(id) {

  return getRef('albums/' + id)
    .once('value');

}



/**
 * Counts the number of albums stored in the library
 * @param  {func} onSuccess   onSuccess callback
 * @param  {func} onError     onError callback
 * @return {int}              total number of albums
 */
export function getAlbumCount(onSuccess, onError) {

  getRef('albums')
    .once('value')
    .then((data) => {
      let i = 0;
      data.forEach(function(item) {
        i++;
      });
      onSuccess(i);
    })
    .catch((error) => console.log(error));

}
