/** Discogs **/

/**
 * Return message of Discogs URI check
 * @param  {String} uri                 Master or release Discogs URI
 * @param  {String} selectedReleaseType 'master' or 'release'
 * @return {String}                     Error message
 */
export function checkDiscogsUri(uri, selectedReleaseType) {

  if (!selectedReleaseType || selectedReleaseType == 'placeholder') {
    return 'Please provide a release type!';
  } else if (uri.indexOf('https://www.discogs.com/') == -1) {
    return 'URI should start with https://www.discogs.com/...';
  } else if (uri.indexOf(selectedReleaseType) == -1) {
    return 'URI should contain ' + selectedReleaseType + '.';
  }

  return null;
}

/**
 * Return message of a listening URI check
 * @param  {String} uri                 Bandcamp or Youtube uri
 * @param  {String} selectedSource 'bandcamp' or 'youtube'
 * @return {String}                     Error message
 */
export function checkListeningUri(uri, selectedSource) {
  if (!selectedSource || selectedSource == 'placeholder') {
    return 'Please provide a source!';
  }

  return (uri.indexOf(selectedSource) == -1)  ? 'URI should contain "' + selectedSource + '".' : null;
}


/** Spotify **/

export function checkSpotifyUri(s) {
  return (s.indexOf('spotify:album:') != 0) ? 'URI should be formed as spotify:album:...' : null;
}
