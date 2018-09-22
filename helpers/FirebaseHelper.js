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

export const formatDiscogsAlbum = ({ id, title = '', images = [], year = '', genres = [], styles = []}, source, url, release_type) => (
  {
    name: title,
    images: formatDiscogsImages(images),
    release_date: year + '',
    streaming_source: source,
    url,
    genres,
    styles,
    release_type,
    sources: {
      discogs: id
    }
  }
);

export const formatDiscogsUpdateAlbum = ({ id, genres = [], styles = []}, release_type) => (
  {
    release_type,
    genres,
    styles,
    discogs_id: id
  }
);

export const formatSpotifyAlbum = ({ id, name = '', external_urls: { spotify = '' }, images = [], release_date = '' }) => (
  {
    name,
    images: formatSpotifyImages(images),
    release_date,
    sources: {
      spotify: id
    }
  }
);

export const formatSpotifyDiscogsAlbum = (
  { id: spotify_id,
    name = '',
    images = [],
    release_date = ''
  }, {
    id: discogs_id,
    genres = [],
    styles = []
  },
  release_type) => (
  {
    name,
    images: formatSpotifyImages(images),
    release_date,
    sources: {
      spotify: spotify_id,
      discogs: discogs_id
    },
    genres,
    styles,
    release_type
  }
);

export const formatAlbumSummary = ({ added_at = '', album: { id, tracks: { total = 0 }}}) => (
  {
    id,
    added_at,
    totalTracks: total
  }
);

export const formatSpotifySingleAlbumSummary = ({ tracks: { total = 0 }}) => (
  {
    totalTracks: total
  }
);

export const formatDiscogsSingleAlbumSummary = ({ tracklist = []}) => (
  {
    totalTracks: tracklist.length
  }
);

export const formatSpotifyArtist = ({ id, name = ''}) => (
  {
    name,
    sources: {
      spotify: id
    }
  }
);

export const formatDiscogsArtist = ({ id, name = '' }) => (
  {
    name,
    sources: {
      discogs: id
    }
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
export function omit(keys, obj) {
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

export function updateOrSetArtistsFromAlbums(items, source) {
  return items.reduce(
    (p, item) => p.then(() => updateOrSetArtistsFromSingleAlbum(formatArtists(item.album.artists, formatSpotifyArtist), formatAlbumSummary(item), source, item.album.id)),
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
export function updateOrSetArtistsFromSingleAlbum(artists, album, source, albumId) {
  return artists.reduce(
    (p, artist) => p.then(() => updateOrSetSingleArtistFromSingleAlbum(artist, album, source, albumId)),
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
function updateOrSetSingleArtistFromSingleAlbum(artist, album, source, albumId) {
  let albumKey;

  if (!album.hasOwnProperty('added_at')) {
    // Add album added date
    album.added_at = new Date().toUTCString();
  }

  function mightUpdateArtist(artistsWithThisId) {
    if (!artistsWithThisId.exists()) { return true; /* did not update */ }
    artistsWithThisId.forEach((artist) => {
      updateArtistAlbumsList(artist.key, album, albumKey);
      return;
    });
  }

  function mightSetArtist(didNotUpdate) {
    if (!didNotUpdate) { return; /* already updated */ }
    const artistWithAlbumProperty = addFirstAlbumToArtist(artist, album, albumKey);
    return setArtist(artistWithAlbumProperty);
  }

  return getAlbumBySource(source, albumId)
    .then((filteredAlbums) => {
      filteredAlbums.forEach((item) => { albumKey = item.key;});
      return getArtistBySource(source, artist.sources[source])
        .then(mightUpdateArtist)
        .then(mightSetArtist);
    });
}


/**
 * Update album property in artist object by adding a new album to the list
 * @param  {object} artist Firebase artist object
 * @param  {object} album  Firebase album object
 * @return {Promise}
 */
function updateArtistAlbumsList(artistId, album, albumKey) {
  return getRef('artists')
    .update({
      [`/${artistId}/albums/${albumKey}`]: {
        'totalTracks': album.totalTracks,
        'added_at': album.added_at
      },
    });
}

function updateMergeArtist(artist0_Id, artist1) {
  let updates = {};

  // Update albums
  Object.keys(artist1.albums).forEach((albumKey) => {
    return updates[`/${artist0_Id}/albums/${albumKey}`] = artist1.albums[albumKey];
  });

  // UPdate sources
  Object.keys(artist1.sources).forEach((sourceKey) => {
    return updates[`/${artist0_Id}/sources/${sourceKey}`] = artist1.sources[sourceKey];
  });

  return getRef('artists')
    .update(updates);
}

function updateArtistSources(artistId, sources) {
  let updates = {
    [`/${artistId}/sources`]: sources
  };

  return getRef('artists')
    .update(updates);
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

export function removeArtist(id) {
  return getRef('artists/' + id).remove();
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
      'totalTracks': album.totalTracks,
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
  return getRef('artists/' + id);
}


export function getArtistBySource(source, id) {

  return getRef('artists')
    .orderByChild('sources/' + source)
    .equalTo(id)
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


export function mergeArtists(artist0Id, artist1) {
  return updateMergeArtist(artist0Id, artist1);
}

export function unmergeArtist(artistId, newSources) {
  return updateArtistSources(artistId, newSources);
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
  return Promise.all(flatten(albums.map((album) => setAlbumIfNotExists(album, false))));
}

/**
 * Return a list of albums with a given id in DB
 * @param  {String} idName  Name of the id field
 * @param  {string} idValue Value of the id field to check against
 * @return {Promise}        DataSnapshot of filter query
 */
function checkIfAlbumExists(source, pathToSource) {
  if (!pathToSource.hasOwnProperty(source)) {
    return false;
  }

  return getAlbumBySource(source, pathToSource[source])
    .then((snapshot) => snapshot.exists());
}

/**
 * If album already exists, do not update, else set album
 * @param {object} album Album object
 */
export function setAlbumIfNotExists(album, throwDuplicateError) {
  return Promise.all([
    checkIfAlbumExists('spotify', album.sources, throwDuplicateError),
    checkIfAlbumExists('discogs', album.sources, throwDuplicateError)
  ]).then((existsArray) => {
    const exists = existsArray.some((item) => item == true);

    if (exists && throwDuplicateError) throw({ message : 'Oops! This album is already in your library!'});
    if (exists) return;
    setAlbum(album);
  });
}

/**
 * Enrich a Spotify album with Discogs data
 * @param  {String} spotifyId Id of Spotfify album as stored in FB
 * @param  {Object} dgAlbum   Formatted discogs album with enriching fields
 * @return {Promise}          Firebase update promise
 */
export function updateSpotifyAlbumWithDiscogsAlbum(spotifyId, dgAlbum) {
  return getAlbumBySource('spotify', spotifyId)
    .then((snapshot) => {
      snapshot.forEach((album) => {
        getRef('albums/' + album.key)
          .update({
            ['/release_type']: dgAlbum.release_type,
            ['/genres'] : dgAlbum.genres,
            ['/styles']: dgAlbum.styles,
            ['/sources/discogs']: dgAlbum.discogs_id
          });
      });
    });
}

/**
 * Get a single album from FB
 * @param  {string} id        Firebase Album id
 * @return {Promise}
 */
export function getAlbum(id) {

  return getRef('albums/' + id)
    .once('value');

}

export function getAlbumBySource(source, id) {

  return getRef('albums')
    .orderByChild('sources/' + source)
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

export function removeAlbum(artistId, albumId) {
  return Promise.all([
    getRef('albums/' + albumId).off('value'),
    getRef('albums/' + albumId).remove(),
    getRef(`artists/${artistId}/albums/${albumId}`).remove()
  ]);
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
  return getArtistBySource(image.source, image.id)
    .then((filteredArtists) => {
      filteredArtists.forEach((item) => {
        updateArtistImage(image, item.key);
      });
    });
}


/**
 * Update artist imgUrl property
 * @param  {object} image Contains artist id and imgUrl
 * @return {Promise}
 */
function updateArtistImage(image, artistId) {
  return getRef('artists')
    .update({
      [`/${artistId}/imgUrl/`]: image.imgUrl
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
