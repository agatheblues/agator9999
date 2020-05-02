import axios from 'axios';
import { databaseConfig } from '../config';

/**
 * Create axios instance for Database requests
 * @return {func}              Axios apiInstance
 */
let apiInstance = null;

const getInstance = () => {
  if (apiInstance) return apiInstance;
  createInstance();
  return apiInstance;
}

const createInstance = () => {
  const token = localStorage.token;

  apiInstance = axios.create({
    baseURL: databaseConfig.databaseURL,
    timeout: 10000,
    headers: { Authorization: `Bearer ${token}` }
  });
}

export const resetInstance = () => { apiInstance = null; };

/**
 * Get a token by passing an email and password
 */
export const getToken = (data) => getInstance().post('/user_token', data);

/**
 * Get current user
 */
export const getUser = () => getInstance().get('/users/current');

/**
 * Create a user
 */
export const createUser = (data) => getInstance().post('/users', data);

/**
* Get list of all artists
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
 * Unmerge an artist
 * @return {Promise}
*/
export const updateArtist = (id, data) => getInstance().patch(`/artists/${id}`, data);

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