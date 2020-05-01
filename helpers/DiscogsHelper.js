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
let discogsInstance = null;

const getInstance = () => {
  if (discogsInstance) return discogsInstance;
  createInstance();
  return discogsInstance;
}

const createInstance = () => {
  discogsInstance = axios.create({
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
export const getSource = (id) => sourceList.filter((s) => (s.id == id))[0].name;

/**
 * Get release type from release type array
 * @param  {String} id id of release type
 * @return {Object}    Release type item
 */
export const getReleaseType = (id) => releaseTypeList.filter((s) => (s.id == id))[0].name;

/**
 * Get a discogs release
 * @param  {string} uri         Discogs url of the release
 * @param  {string} releaseType 'release' or 'master'
 * @return {Object}             Discogs release object
 */
export const getRelease = (uri, releaseType) => getInstance().get('/' + releaseType + 's/' + getReleaseId(uri, releaseType));

/**
 * Get a list of discogs artists
 * @param {Array} artists 
 * @return {Promise}
 */
export const getArtists = (artists) => Promise.all(artists.map((artist) => getArtist(artist.id)));

/**
 * Extract Id of release or master release
 * @param  {String} uri  Discogs url of the album
 * @param  {String} type 'master' or 'release'
 * @return {String}      Id of the master or the release
 */
const getReleaseId = (uri, releaseType) => uri.slice(uri.indexOf(`/${releaseType}/`) + releaseType.length + 2);

/**
 * Get artist from Discogs
 * @param  {string} id Artist id
 * @return {Object}    Discogs' artist object
 */
const getArtist = (id) => {
  if (id == 194) { // PLaceholder for Various artists
    return new Promise(() => ({ data: { id: id, images: [] } }), () => { });
  }
  return getInstance().get(`/artists/${id}`);
}