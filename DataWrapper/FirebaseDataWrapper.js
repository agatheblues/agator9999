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
    added_at,
    id,
    name,
    spotify
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

export function pushAlbums(items, db) {
  let albums = items.map(item => convertToAlbumFromSpotify(item));
  let ref = db.ref('albums');
  ref.push(albums);

}

export function pushArtists(items, db) {
  let artists = flatten(items.map(item => item.album.artists.map(artist => convertToArtistFromSpotify(artist))));
  let ref = db.ref('artists');
  ref.push(artists);
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

// ref.once('value', gotData, errData);
//
// function errData(err) {
//   console.log(err);
// }
//
// function gotData(data) {
//   console.log(data.val().name);
// }
