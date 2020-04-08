import axios from 'axios';
import { databaseConfig } from '../config';
import * as discogs from './DiscogsHelper';
import * as spotify from './SpotifyHelper';


const TOKEN = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJleHAiOjE1ODY1NDA0NzIsInN1YiI6Mn0.WU9q_hrmf5w5k7xFaJladWoZ9oRPVgVyEZJKgAXaFz8';
/**
 * Create axios instance for Database requests
 * @return {func}              Axios instance
 */
function getInstance() {
  return axios.create({
    baseURL: databaseConfig.databaseURL,
    timeout: 10000,
    headers: { Authorization: `Bearer ${TOKEN}` }
  });
}

/**
 * Get list of all artists stored in Firebase
 * @return {Promise}
 */
export const getArtists = () => getInstance().get('/artists');

/**
 * Get an artist
 * @return {Promise}
 */
export const getArtist = (id) => getInstance().get(`/artists/${id}`);

/**
 * Merge two artist
 * @return {Promise}
*/
export const mergeArtists = (id1, id2) => getInstance().post(`/artists/${id1},${id2}`);

/**
 * Delete an album
 * @return {Promise}
 */
export const deleteAlbum = (id) => getInstance().delete(`/albums/${id}`)

/**
 * Create an album
 * @return {Promise}
*/
const createAlbum = (data) => getInstance().post('/albums', data);

/**
 * Update an album
 * @return {Promise}
*/
const updateAlbum = (id, data) => getInstance().patch(`/albums/${id}`, data);


/**
 * Create an album from Discogs. 
 * First get the album data, then for each artists get the artist data.
 * @return {Promise}
 */
export const createDiscogsAlbum = (discogsUri, releaseType, source, listeningUri) => {
  let album;
  return discogs.getRelease(discogsUri, releaseType)
    .then(({ data }) => {
      album = formatDiscogsAlbum(data, source, listeningUri);
      return discogs.getArtists(data.artists);
    })
    .then((response) => {
      const artists = response.map(({ data }) => data);
      album.artists = formatDiscogsArtists(artists)
      return createAlbum(album)
    });
}

/**
 * Create an album from Spotify and Discogs data
 * First get the album data, then for each artists get the artist data.
 * @return {Promise}
 */
export const createSpotifyDiscogsAlbum = (spotifyUri, discogsUri, releaseType, token) => {
  let album;
  return Promise.all([
    spotify.getAlbum(token, spotifyUri),
    discogs.getRelease(discogsUri, releaseType)
  ])
    .then((response) => {
      // Just in case
      if (response.length != 2) { throw ({ message: 'Oops! Something went wrong while retrieving data from Spotify or Discogs.' }); }

      const data = response.map(({ data }) => data);
      album = formatSpotifyDiscogsAlbum(data[0], data[1]);

      const ids = data[0].artists.map(artist => artist.id);
      return spotify.getArtists(token, ids)
    })
    .then((response) => {
      const artists = flatten(response.map(({ data }) => data.artists));
      album.artists = formatSpotifyArtists(artists);
      return createAlbum(album);
    });
}

/**
 * Create an album from Spotify data
 * First get the album data, then for each artists get the artist data.
 * @return {Promise}
 */
export const createSpotifyAlbum = (token, albumData, added_at) => {
  let album = formatSpotifyAlbum(albumData, added_at);
  const ids = albumData.artists.map(artist => artist.id);

  return spotify.getArtists(token, ids)
    .then((response) => {
      const artists = flatten(response.map(({ data }) => data.artists));
      album.artists = formatSpotifyArtists(artists);
      return createAlbum(album);
    })
    .catch(error => {
      if (error.response.status == 409) return null; // Ignore Conflicts
      if (error.response.status == 429) {            // Rate limiting
        return retryAfter(error, () => createSpotifyAlbum(token, albumData, added_at));
        // return null;
      }
      console.log("i am here", error.response)
      throw ({ message: error.response.data.message });
    })
}

export const updateAlbumWithDiscogs = (albumId, discogsUri, releaseType) => {
  return discogs.getRelease(discogsUri, releaseType)
    .then(({ data }) => {
      const { id, genres, styles } = data;
      const updates = {
        discogs_id: id + '',
        genres: formatGenresOrStyles(genres),
        styles: formatGenresOrStyles(styles),
      };
      return updateAlbum(albumId, updates);
    });
}

export const synchronizeSpotifyAlbums = (token, offset) => {
  return spotify.getAlbumsPage(token, offset)
    .then(({ data: { items, next } }) => {
      console.log(offset, items, next)
      const arrayOfPromises = items.map(({ album, added_at }) => createSpotifyAlbum(token, album, added_at))

      console.log("Next page");
      // If there is a next page, push next promise to array
      if (next) { arrayOfPromises.push(synchronizeSpotifyAlbums(token, offset + 50)); }
      return Promise.all(arrayOfPromises);
    })
    .catch(error => {
      if (error.response.status == 429) {            // Rate limiting
        return retryAfter(error, () => synchronizeSpotifyAlbums(token, offset));
        // return null;
      }
      console.log("i am here 2", error.response)
      throw ({ message: error.response.data.message });
    })
}

const retryAfter = (error, callback) => {
  const milliseconds = error.response.headers['retry-after'] * 1000;
  if (milliseconds) {
    console.log("retrying....")
    return setTimeout(callback, milliseconds);
  }
  return null;
}

//////////////////// FORMATTING
const formatDiscogsArtists = (artists) => artists.map(({ id, name, images = [] }) => {
  const resource_url = images.length === 0 ? null : images[0].resource_url;

  return {
    name: name,
    discogs_id: id + '',
    img_url: resource_url
  };
});

const formatGenresOrStyles = (values) => values.map((value) => ({ name: value }));

const formatDiscogsImage = (images) => {
  if (images.length == 0) return {};
  const { height = null, width = null, resource_url = '' } = images[0];

  return {
    img_height: height,
    img_width: width,
    img_url: resource_url
  };
};

const formatDiscogsAlbum = (data, source, listeningUri) => {
  const { id, title = '', images = [], year = '', genres = [], styles = [], tracklist = [] } = data;
  const bandcamp_url = source === 'bandcamp' ? listeningUri : '';
  const youtube_url = source === 'youtube' ? listeningUri : '';
  const date = new Date(Date.now());

  return {
    name: title,
    release_date: year + '',
    discogs_id: id + '',
    bandcamp_url: bandcamp_url,
    youtube_url: youtube_url,
    genres: formatGenresOrStyles(genres),
    styles: formatGenresOrStyles(styles),
    total_tracks: tracklist.length,
    added_at: date.toISOString(),
    ...formatDiscogsImage(images)
  }
};

const formatSpotifyImage = (images) => {
  if (images.length == 0) return {};
  const { height = null, width = null, url = '' } = images[0];

  return {
    img_height: height,
    img_width: width,
    img_url: url
  };
};

const formatSpotifyDiscogsAlbum = (spotifyData, discogsData) => {
  const { id: spotifyId, name = '', external_urls: { spotify = '' }, images = [], release_date = '', total_tracks } = spotifyData;
  const { id: discogsId, genres, styles } = discogsData;
  const date = new Date(Date.now());

  return {
    name: name,
    release_date: release_date,
    discogs_id: discogsId + '',
    spotify_id: spotifyId,
    bandcamp_url: '',
    youtube_url: '',
    genres: formatGenresOrStyles(genres),
    styles: formatGenresOrStyles(styles),
    total_tracks: total_tracks,
    added_at: date.toISOString(),
    ...formatSpotifyImage(images)
  }
};

const formatSpotifyAlbum = (data, added_at) => {
  const { id: spotifyId, name = '', external_urls: { spotify = '' }, images = [], release_date = '', total_tracks } = data;

  return {
    name: name,
    release_date: release_date,
    spotify_id: spotifyId,
    bandcamp_url: '',
    youtube_url: '',
    total_tracks: total_tracks,
    added_at: added_at,
    ...formatSpotifyImage(images)
  }
};

const formatSpotifyArtists = (artists) => artists.map(({ id, name, images = [] }) => {
  const url = images.length === 0 ? null : images[0].url;

  return {
    name: name,
    spotify_id: id,
    img_url: url
  };
});

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