import axios from 'axios';
import firebase from 'firebase/app';
import 'firebase/auth';
import 'firebase/database';
import { firebaseConfig } from '../config';

/******* FORMATTING *******/

export const formatSpotifyAlbums = ({ added_at = '', album = {} }) => (
  {
    added_at,
    ...formatSpotifyAlbum(album)
  }
);

function formatDiscogsImages(images) {
  if (images.length > 0) {
    return formatDiscogsImage(images[0]);
  }

  return null;
};

function formatSpotifyImages(images) {
  if (images.length > 0) {
    return formatSpotifyImage(images[0]);
  }

  return null;
};

const formatDiscogsImage = ({ height = null, width = null, resource_url = '' }) => (
  {
    height,
    width,
    imgUrl: resource_url
  }
);

const formatSpotifyImage = ({ height = null, width = null, url = '' }) => (
  {
    height,
    width,
    imgUrl: url
  }
);

export const formatDiscogsAlbum = ({ id, title = '', images = [], year = '', genres = [], styles = [], resource_url = ''}, source, url) => (
  {
    id,
    name: title,
    images: formatDiscogsImages(images),
    release_date: year + '',
    source,
    url,
    discogs_url: resource_url,
    genres,
    styles,
    discogs_id: id
  }
);

export const formatDiscogsUpdateAlbum = ({ id, genres = [], styles = [], resource_url = ''}) => (
  {
    discogs_url: resource_url,
    genres,
    styles,
    discogs_id: id
  }
);

export const formatSpotifyAlbum = ({ id, name = '', external_urls: { spotify = '' }, images = [], release_date = '' }) => (
  {
    name,
    url: spotify,
    images: formatSpotifyImages(images),
    release_date,
    source: 'spotify',
    spotify_id: id
  }
);

export const formatSpotifyDiscogsAlbum = (
  { id: spotify_id,
    name = '',
    external_urls: { spotify = '' },
    images = [],
    release_date = ''
  }, {
    id: discogs_id,
    genres = [],
    styles = [],
    resource_url = ''
  }) => (
  {
    name,
    url: spotify,
    images: formatSpotifyImages(images),
    release_date,
    source: 'spotify',
    spotify_id: spotify_id,
    discogs_url: resource_url,
    genres,
    styles,
    discogs_id: discogs_id
  }
);

export const formatAlbumSummary = ({ added_at = '', album: { id, tracks: { total = 0 }}}) => (
  {
    id,
    added_at,
    tracks: { total }
  }
);

export const formatSpotifySingleAlbumSummary = ({ id, tracks: { total = 0 }}) => (
  {
    tracks: { total }
  }
);

export const formatDiscogsSingleAlbumSummary = ({ id, tracklist = []}) => (
  {
    id,
    tracks: { total: tracklist.length }
  }
);

export const formatSpotifyArtist = ({ id, name = '', external_urls: { spotify = '' } }) => (
  {
    name,
    url: spotify,
    source: 'spotify',
    spotify_id: id
  }
);

export const formatDiscogsArtist = ({ id, name = '' }) => (
  {
    id,
    name,
    discogs_id: id
  }
);


/**
 * Format the array of array of artists send back by /me/albums
 * @param  {array} items Array of albums
 * @return {array}       Array of artists
 */
export function formatArtists(artists, formatMethod) {
  return artists.map(artist => formatMethod(artist));
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
export function init() {
  if (firebase.apps.length) {
    return;
  }
  firebase.initializeApp(firebaseConfig);
}


/**
 * Get firebase database reference
 * @return {Object} FB database ref
 */
export function getFbDb() {
  return firebase.database();
}


/**
 * Get Firebase ref
 * @param  {String} path Path to ref
 * @return {object}      Firebase ref
 */
export function getRef(path) {
  return getFbDb().ref(path);
}

/**
 * Get Firebase auth
 */
export function getAuth() {
  return firebase.auth();
}

export function getFbSignOut() {
  return getAuth().signOut();
}
/**
 * Get Firebase available sign in options
 */
export function getSignInProviders() {
  return [
    firebase.auth.GoogleAuthProvider.PROVIDER_ID
  ];
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
  return items.reduce(
    (p, item) => p.then(() => updateOrSetArtistsFromSingleAlbum(formatArtists(item.album.artists, formatSpotifyArtist), formatAlbumSummary(item))),
    Promise.resolve()
  );
}

/**
 * If artists already exist in Firebase, update their album list
 * else, set new artists
 * @param  {object} artists List of Firebase artist object
 * @param  {object} album   Firebase album object
 * @return {Promise}
 */
export function updateOrSetArtistsFromSingleAlbum(artists, album, albumSourceId, albumId) {
  console.log(artists, album, albumSourceId, albumId);
  return artists.reduce(
    (p, artist) => p.then(() => updateOrSetSingleArtistFromSingleAlbum(artist, album, albumSourceId, albumId)),
    Promise.resolve()
  );
}


/**
 * If artist already exists in Firebase, update its album list
 * else, set new artist
 * @param  {object} artist Firebase artist object
 * @param  {object} album  Firebase album object
 * @return {Promise}
 */
function updateOrSetSingleArtistFromSingleAlbum(artist, album, albumSourceId, albumId) {
  console.log('single', artist, album, albumSourceId, albumId);
  function mightUpdateArtist(snapshot) {
    if (!snapshot.exists()) { return true; /* did not update */ }
    updateArtistAlbumsList(artist, album);
  }

  function mightSetArtist(didNotUpdate) {
    if (!didNotUpdate) { return; /* already updated */ }
    getAlbumBySource(albumSourceId, albumId)
      .then((snapshot) => {
        snapshot.forEach((item) => {
          const artistWithAlbum = addFirstAlbumToArtist(artist, album, item.key);
          setArtist(artistWithAlbum);
        });
      });
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
      [`/${artist.id}/albums/${album.id}`]: {
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
    .push()
    .set(artist);
}


/**
 * Add the album property to the artist object
 * @param {object} artist Firebase artist object
 * @param {object} album  Firebase album object
 * @return {object}       Firebase artist object
 */
function addFirstAlbumToArtist(artist, album, key) {
  artist['albums'] = {
    [key]: {
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

export function formatArtistList(data) {
  let artists = [];

  data.forEach(function(item) {
    let artist = item.val();
    artist.id = item.key;
    artists.push(artist);
  });

  return artists;
}


/**
 * Get list of artist ids
 * @param  {array} artists List of artists
 * @return {array}         List of artists ids
 */
export function getArtistIds(artists) {
  return artists.map(artist => artist.id);
}


/********** ALBUMS *********/

/**
 * Save a single album in Firebase with an auto-generated key
 * @param  {objet} item       Spotify Album
 */
function setAlbum(album) {
  if (!album.hasOwnProperty('added_at')) {
    // Add album added date
    album.added_at = new Date().toUTCString();
  }

  return getRef('albums').push().set(album);
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

/**
 * Return a list of albums with a given id in DB
 * @param  {String} idName  Name of the id field
 * @param  {string} idValue Value of the id field to check against
 * @return {Promise}        DataSnapshot of filter query
 */
function checkIfAlbumExists(idName, idValue) {
  return getAlbumBySource(idName, idValue)
    .then(function(snapshot) {
      if (snapshot.exists()) { throw({ message : 'Oops! This album is already in your library!'});}
    });
}

/**
 * If album already exists, do not update, else set album
 * @param {object} album Album object
 */
export function setAlbumIfNotExists(album) {
  return Promise.all([
    checkIfAlbumExists('spotify_id', album.spotify_id),
    checkIfAlbumExists('discogs_id', album.discogs_id)
  ]).then(() => setAlbum(album));
}

/**
 * Enrich a Spotify album with Discogs data
 * @param  {String} spotifyId Id of Spotfify album as stored in FB
 * @param  {Object} dgAlbum   Formatted discogs album with enriching fields
 * @return {Promise}          Firebase update promise
 */
export function updateSpotifyAlbumWithDiscogsAlbum(spotifyId, dgAlbum) {
  return getRef('albums/' + spotifyId)
    .update({
      ['/discogs_url']: dgAlbum.discogs_url,
      ['/genres'] : dgAlbum.genres,
      ['/styles']: dgAlbum.styles,
      ['/discogs_id']: dgAlbum.discogs_id
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

export function getAlbumBySource(sourceName, id) {
  return getRef('albums')
    .orderByChild(sourceName)
    .equalTo(id)
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
      [`/${image.id}/imgUrl/`]: image.imgUrl
    });
}


/************ USERS ****************/
export function getUser(email) {
  return getRef('users')
    .orderByChild('email')
    .equalTo(email)
    .once('value');
}

export function getDiscogsSecret() {
  return getRef('secrets/discogs_secret')
    .once('value');
}