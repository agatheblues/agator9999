import * as discogs from './DiscogsHelper';
import * as spotify from './SpotifyHelper';
import * as api from './ApiHelper';
import * as format from './FormatHelper';
import { flatten } from './utils';

/**
 * Create an album from Discogs. 
 * First get the album data, then for each artists get the artist data.
 * @return {Promise}
 */
export const createDiscogsAlbum = (discogsUri, releaseType, source, listeningUri) => {
  let album;

  return discogs.getRelease(discogsUri, releaseType)
    .then(({ data }) => {
      album = format.formatDiscogsAlbum(data, source, listeningUri);
      return discogs.getArtists(data.artists);
    })
    .then((response) => {
      const artists = response.map(({ data }) => data);
      album.artists = format.formatDiscogsArtists(artists)
      return api.createAlbum(album)
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
      const data = response.map(({ data }) => data);
      album = format.formatSpotifyDiscogsAlbum(data[0], data[1]);

      const ids = data[0].artists.map(artist => artist.id);
      return spotify.getArtists(token, ids)
    })
    .then((response) => {
      const artists = flatten(response.map(({ data }) => data.artists));
      album.artists = format.formatSpotifyArtists(artists);
      return api.createAlbum(album);
    });
}

/**
 * Update a Spotify album with discogs data
 * @param {Number} albumId DB id of album to update
 * @param {String} discogsUri URI of the discogs album
 * @param {String} releaseType master or release
 * @return {Promise}
 */
export const updateAlbumWithDiscogs = (albumId, discogsUri, releaseType) => {
  return discogs.getRelease(discogsUri, releaseType)
    .then(({ data }) => {
      const { id, genres, styles } = data;
      const updates = format.formatDiscogsUpdateAlbum(id, genres, styles);
      return api.updateAlbum(albumId, updates);
    });
}

/**
 * Orchestrates the synchronisation of the user's collection of albums in Spotify
 * to the DB. 
 * - First get all the albums
 * - Then get all the artists from those albums
 * - Format and save to DB
 * @param {String} accessToken Spotify access token
 * @param {Number} limit       Number of items in batches (max is 50)
 * @return {Promise}
 */
export const synchronizeSpotifyCollection = (accessToken, limit) => {
  let albums;

  return getSpotifyAlbumCollection(accessToken, limit)
    .then((response) => {
      albums = flatten(response.map(({ data: { items } }) => items));
      const artistIds = flatten(albums.map(({ album: { artists } }) => artists.map(({ id }) => id)));
      const uniqueArtistIds = [...new Set(artistIds)];

      // Get all the artists from the albums by chunks of {limit}
      return spotify.getArtists(accessToken, uniqueArtistIds, limit)
    })
    .then((response) => {
      // Reassign the formatted artists to their album, then batch create to DB
      const artistsData = flatten(response.map(({ data: { artists } }) => artists));
      const albumsList = assignArtistsToAlbums(albums, artistsData);

      return api.createAlbumsBatch(albumsList);
    });
}

/**
 * Retrieves all the albums in the user's collection
 * @param {String} accessToken Spotify access token
 * @param {Number} limit       Number of items in batches (max is 50)
 * @return {Promise}
 */
const getSpotifyAlbumCollection = (accessToken, limit) => {
  return spotify.getAlbumsPage(accessToken, 0, limit)   // Get the first page
    .then(({ data: { total } }) => {
      // Compute how many pages to request
      const remainder = total % limit;
      const quotient = (remainder == 0) ? Math.floor(total / limit) : Math.floor(total / limit) + 1;

      // Prepare all requests
      const arrayOfPromises = Array(quotient).fill().map((_, i) => spotify.getAlbumsPage(accessToken, i * limit, limit))
      return Promise.all(arrayOfPromises);
    })
}

/**
 * For a given list of albums and artists, returns the list of albums
 * with an `artists` key, being the array of artists for each album.
 * @param {Array} albums 
 * @param {Array} artistsData 
 */
const assignArtistsToAlbums = (albums, artistsData) => albums.map(({ album, added_at }) => {
  const artistIds = album.artists.map(({ id }) => id);
  const artists = artistsData.filter(({ id }) => artistIds.includes(id));
  return {
    ...format.formatSpotifyAlbum(album, added_at),
    artists: format.formatSpotifyArtists(artists)
  };
});