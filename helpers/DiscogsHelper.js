import axios from 'axios';
import { discogsConfig } from '../config';

export const releaseTypeList = [
  { 'id': 'placeholder', 'name': 'Select type', 'hide': true },
  { 'id': 'master', 'name': 'Master' },
  { 'id': 'release', 'name': 'Release' }
];

export const sourceList = [
  { 'id': 'placeholder', 'name': 'Select source', 'hide': true },
  { 'id': 'bandcamp', 'name': 'Bandcamp' },
  { 'id': 'youtube', 'name': 'Youtube' }
];

/**
 * Create axios instance for Discogs API requests
 * @return {func}              Axios instance
 */
function getInstance() {
  return axios.create({
    baseURL: 'https://api.discogs.com/',
    headers: {
      'Authorization': `Discogs key=${discogsConfig.CONSUMER_KEY}, secret=${discogsConfig.CONSUMER_SECRET}`
    }
  });
}

/**
 * Get source from source array
 * @param  {String} id id of source
 * @return {Object}    Source item
 */
export function getSource(id) {
  return this.sourceList.filter((s) => (s.id == id))[0].name;
}

/**
 * Get release type from release type array
 * @param  {String} id id of release type
 * @return {Object}    Release type item
 */
export function getReleaseType(id) {
  return this.releaseTypeList.filter((s) => (s.id == id))[0].name;
}


/**************** RELEASE ******************/

/**
 * Get a discogs release
 * @param  {string} uri         Discogs url of the release
 * @param  {string} releaseType 'release' or 'master'
 * @return {Object}             Discogs release object
 */
export function getRelease(uri, releaseType) {
  const id = getReleaseId(uri, releaseType);

  return getInstance().get('/' + releaseType + 's/' + id);
}

/**
 * Extract Id of release or master release
 * @param  {String} uri  Discogs url of the album
 * @param  {String} type 'master' or 'release'
 * @return {String}      Id of the master or the release
 */
function getReleaseId(uri, releaseType) {
  return uri.slice(uri.indexOf(`/${releaseType}/`) + releaseType.length + 2);
}


/**************** ARTIST ******************/

/**
 * Get artist from Discogs
 * @param  {string} id Artist id
 * @return {Object}    Discogs' artist object
 */
function getArtist(id) {
  if (id == 194) { // PLaceholder for Various artists
    return new Promise(() => ({ data: { id: id, images: [] } }), () => { });
  }
  return getInstance().get(`/artists/${id}`);
}

export function getArtists(artists) {
  return Promise.all(artists.map((artist) => getArtist(artist.id)));
}