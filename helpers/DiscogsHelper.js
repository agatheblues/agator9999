import axios from 'axios';
import * as fb from './FirebaseHelper';
import { discogsConfig } from '../discogs.config';

/**
 * Create axios instance for Discogs API requests
 * @return {func}              Axios instance
 */
function getInstance() {
  return axios.create({
    baseURL: 'https://api.discogs.com/',
    headers: {
      'User-Agent' : 'Agator9999/1.0 +http://localhost:8888.com',
      'Authorization': 'Discogs key=' + discogsConfig.CONSUMER_KEY + ', secret=' + discogsConfig.CONSUMER_SECRET }
  });
}

/**
 * Extract Id of release or master release
 * @param  {String} uri  Discogs url of the album
 * @param  {String} type 'master' or 'release'
 * @return {String}      Id of the master or the release
 */
function getReleaseId(uri, releaseType) {
  return uri.slice(uri.indexOf('/' + releaseType + '/') + releaseType.length + 2);
}


export function getRelease(uri, releaseType) {
  console.log(uri, releaseType);
  const id = getReleaseId(uri, releaseType);

  return getInstance()
    .get('/' + releaseType + 's/' + id);

}


export function getArtistsImages(artistIds) {

  const arrayOfImagePromises = artistIds.map((id) =>
    getArtistImages(id)
      .then((response) => {
        console.log('images ', id, response);
        // fb.updateArtistsImages(formatArtistsImages(response.data.artists)))
      })
  );

  return Promise.all(arrayOfImagePromises);
}


function getArtistImages(id) {
  return getInstance()
    .get('/artists/' + id);
}
