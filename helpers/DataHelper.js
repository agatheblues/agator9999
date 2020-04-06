import axios from 'axios';
import { databaseConfig } from '../config';
import * as discogs from './DiscogsHelper';

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
 * Delete an album
 * @return {Promise}
 */
export const deleteAlbum = (id) => getInstance().delete(`/albums/${id}`)

/**
 * Create an album
 * @return {Promise}
*/
const createAlbum = (data) => getInstance().post(`/albums`, data);



/**
 * Create an album from Discogs. 
 * First get the album data, then for each artists get the artist data.
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

//////////////////// FORMATTING
const formatDiscogsArtists = (artists) => artists.map(({ id, name, images = [] }) => {
  const resource_url = images.length === 0 ? '/static/images/missing.jpg' : images[0].resource_url;

  return {
    name: name,
    discogs_id: id + '',
    img_url: resource_url
  };
});

const formatGenresOrStyles = (values) => values.map((value) => ({ name: value }));

const formatDiscogsImage = (images) => {
  if (images.length == 0) {
    return {
      img_height: height,
      img_width: width,
      img_url: resource_url
    };
  } else {
    const { height = null, width = null, resource_url = '' } = images[0];

    return {
      img_height: height,
      img_width: width,
      img_url: resource_url
    };
  }
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
