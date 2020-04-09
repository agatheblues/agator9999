import axios from 'axios';
import { databaseConfig } from '../config';

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
export const createAlbum = (data) => getInstance().post('/albums', data);

/**
 * Create many albums
 * @return {Promise}
*/
export const createAlbums = (data) => getInstance().post('/batch/albums', { albums: data });

/**
 * Update an album
 * @return {Promise}
*/
export const updateAlbum = (id, data) => getInstance().patch(`/albums/${id}`, data);