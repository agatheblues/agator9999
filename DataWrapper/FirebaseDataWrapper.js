import axios from 'axios';

let albumStructure = (
  {
    added_at,
    album: {
      id,
      name,
      external_urls:  {spotify}
    }
  }) => (
  {
    id,
    album: {
      added_at,
      name,
      spotify
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
    artist: {
      name,
      spotify
    }
  });


export function pushAlbums(items, db) {

  // Flatten the array of albums
  const albums = items.map(item => convertToAlbumFromSpotify(item));
  // Create /albums ref
  const ref = db.ref('albums');

  // Get album Ids already in the db
  const albumIdsAlreadyInDb = getAllKeys(ref);

  // Compare albums to those in the DB, extract only ids that are not there yet
  const newAlbums = albums.filter(album => !isInArray(albumIdsAlreadyInDb, album.id));

  // Push new albums to DB
  newAlbums.forEach(album => ref.child(album.id).set(album.album));

}

export function pushArtists(items, db) {

  // Flatten the array of artists
  const artists = flatten(items.map(item => item.album.artists.map(artist => convertToArtistFromSpotify(artist))));

  // Create /artist ref
  const ref = db.ref('artists');

  // Get artists Ids already in the db
  const artistIdsAlreadyInDb = getAllKeys(ref);

  // Compare artists to those in the DB, extract only ids that are not there yet
  const newArtists = artists.filter(artist => !isInArray(artistIdsAlreadyInDb, artist.id));

  // Push new artists to DB
  newArtists.forEach(artist => ref.child(artist.id).set(artist.artist));
}


/**
 * Get all key names of first level of data
 * @param  {ref} ref Reference to a db path
 * @return {array}     array of keys
 */
function getAllKeys(ref) {
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
  return renameSpotifyKeyToUrl(album);
}


/**
 * Convert an artist object returned by spotify to a simpler artist object
 * @param  {object} item artist object from spotify
 * @return {object}      artist object for DB
 */
function convertToArtistFromSpotify(item) {
  let artist = artistStructure(item);
  return renameSpotifyKeyToUrl(artist);
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
 * Flattens an array
 * @param  {array} arr Array of arrays
 * @return {array}     Array
 */
function flatten(arr) {
  return arr.reduce(function (flat, toFlatten) {
    return flat.concat(Array.isArray(toFlatten) ? flatten(toFlatten) : toFlatten);
  }, []);
}
