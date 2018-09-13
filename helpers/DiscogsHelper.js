import axios from 'axios';
import * as fb from './FirebaseHelper';
import { discogsConfig } from '../config';

export const releaseTypeList = [
  {'id': 'placeholder', 'name': 'Select type', 'hide': true},
  {'id': 'master', 'name': 'Master'},
  {'id': 'release', 'name': 'Release'}
];

export const sourceList = [
  {'id': 'placeholder', 'name': 'Select source', 'hide': true},
  {'id': 'bandcamp', 'name': 'Bandcamp'},
  {'id': 'youtube', 'name': 'Youtube'}
];

/**
 * Create axios instance for Discogs API requests
 * @return {func}              Axios instance
 */
function getInstance() {
  return fb.getDiscogsSecret()
    .then((data) => {
      let secret = data.val();
      
      return axios.create({
        baseURL: 'https://api.discogs.com/',
        headers: {
          'Authorization': `Discogs key=${discogsConfig.CONSUMER_KEY}, secret=${secret}`
        }
      });
    })
    .catch((error) => {console.log(error);});
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

  return getInstance()
    .then((instance) => instance.get('/' + releaseType + 's/' + id));
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
  return getInstance()
    .then((instance) => instance.get(`/artists/${id}`));
}


/**************** ARTIST IMAGE ******************/

export function getArtistsImages(artistIds) {

  const arrayOfImagePromises = artistIds.map((id) =>
    getArtist(id)
      .then(({data}) => {
        fb.updateArtistsImages(formatArtistsImages(data));
      })
  );

  return Promise.all(arrayOfImagePromises);
}


/**
 * Format an artist object into the artist image array expected by FB
 * @param  {object} artist Artist object as sent back by Discogs
 * @return {Array}        Array with one formatted artist object
 */
function formatArtistsImages(artist) {
  return [{
    id: artist.id,
    imgUrl: getArtistImageUrl(artist)
  }];
}


/**
 * For a given artist object, return its first image url or returned
 * default image
 * @param  {object} artist Discogs Artist
 * @return {String}        Image url
 */
function getArtistImageUrl(artist) {
  if (artist.hasOwnProperty('images') && (artist.images.length > 0)) {
    return artist.images[0].resource_url;
  }


  // TODO: Return image from latest album from artist
  return '/static/images/missing.jpg';
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
