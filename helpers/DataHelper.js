import * as discogs from './DiscogsHelper';
import * as spotify from './SpotifyHelper';
import * as api from './ApiHelper';
import * as format from './FormatHelper';
import { splitArrayInChunks, flatten } from './utils';

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

export const updateAlbumWithDiscogs = (albumId, discogsUri, releaseType) => {
  return discogs.getRelease(discogsUri, releaseType)
    .then(({ data }) => {
      const { id, genres, styles } = data;
      const updates = format.formatDiscogsUpdateAlbum(id, genres, styles);
      return api.updateAlbum(albumId, updates);
    });
}

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

      // Create batches of 25 albums
      const albumChunks = splitArrayInChunks(albumsList, 25);
      return Promise.all(albumChunks.map((chunk) => api.createAlbums(chunk)));
    });
}

const getSpotifyAlbumCollection = (token, limit) => {
  return spotify.getAlbumsPage(token, 0, limit)   // Get the first page
    .then(({ data: { total } }) => {
      // Compute how many pages to request
      const remainder = total % limit;
      const quotient = (remainder == 0) ? Math.floor(total / limit) : Math.floor(total / limit) + 1;

      // Prepare all requests
      const arrayOfPromises = Array(quotient).fill().map((_, i) => spotify.getAlbumsPage(token, i * limit, limit))
      return Promise.all(arrayOfPromises);
    })
}

const assignArtistsToAlbums = (albums, artistsData) => {
  return albums.map(({ album, added_at }) => {
    const artistIds = album.artists.map(({ id }) => id);
    const artists = artistsData.filter(({ id }) => artistIds.includes(id));
    return { ...format.formatSpotifyAlbum(album, added_at), artists: format.formatSpotifyArtists(artists) };
  });
}