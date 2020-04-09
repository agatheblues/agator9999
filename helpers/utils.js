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