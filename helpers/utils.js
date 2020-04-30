/**
 * Split a given array into chunks of a given length
 * @param  {array} arr   Array to split
 * @param  {int} chunkLength Length of a chunk
 * @return {array[array]}       array of array chunks
 */
export const splitArrayInChunks = (arr, chunkLength) => {
  let i, j;
  let result = [];

  for (i = 0, j = arr.length; i < j; i += chunkLength) {
    result.push(arr.slice(i, i + chunkLength));
  }

  return result;
}

/**
 * Flattens an array
 * @param  {array} arr Array of arrays
 * @return {array}     Array
 */
export const flatten = (arr) => {
  return arr.reduce(function (flat, toFlatten) {
    return flat.concat(Array.isArray(toFlatten) ? flatten(toFlatten) : toFlatten);
  }, []);
}

export const passwordRegex = /(?=.*[0-9])/;

export const emailRegex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

export const usernameRegex = /^[a-zA-Z0-9]+$/;