export const formatDiscogsArtists = (artists) => artists.map(({ id, name, images = [] }) => {
  const resource_url = images.length === 0 ? null : images[0].resource_url;

  return {
    name: name,
    discogs_id: id + '',
    img_url: resource_url
  };
});

export const formatDiscogsAlbum = (data, source, listeningUri) => {
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

export const formatDiscogsUpdateAlbum = (id, genres, styles) => ({
  discogs_id: id + '',
  genres: formatGenresOrStyles(genres),
  styles: formatGenresOrStyles(styles),
});

export const formatSpotifyDiscogsAlbum = (spotifyData, discogsData) => {
  const { id: spotifyId, name = '', external_urls: { spotify = '' }, images = [], release_date = '', total_tracks } = spotifyData;
  const { id: discogsId, genres, styles } = discogsData;
  const date = new Date(Date.now());

  return {
    name: name,
    release_date: release_date,
    discogs_id: discogsId + '',
    spotify_id: spotifyId,
    bandcamp_url: '',
    youtube_url: '',
    genres: formatGenresOrStyles(genres),
    styles: formatGenresOrStyles(styles),
    total_tracks: total_tracks,
    added_at: date.toISOString(),
    ...formatSpotifyImage(images)
  }
};

export const formatSpotifyAlbum = (data, added_at) => {
  const { id: spotifyId, name = '', external_urls: { spotify = '' }, images = [], release_date = '', total_tracks } = data;

  return {
    name: name,
    release_date: release_date,
    spotify_id: spotifyId,
    bandcamp_url: '',
    youtube_url: '',
    total_tracks: total_tracks,
    added_at: added_at,
    ...formatSpotifyImage(images)
  }
};

export const formatSpotifyArtists = (artists) => artists.map(({ id, name, images = [] }) => {
  const url = images.length === 0 ? null : images[0].url;

  return {
    name: name,
    spotify_id: id,
    img_url: url
  };
});

const formatSpotifyImage = (images) => {
  if (images.length == 0) return {};
  const { height = null, width = null, url = '' } = images[0];

  return {
    img_height: height,
    img_width: width,
    img_url: url
  };
};

const formatDiscogsImage = (images) => {
  if (images.length == 0) return {};
  const { height = null, width = null, resource_url = '' } = images[0];

  return {
    img_height: height,
    img_width: width,
    img_url: resource_url
  };
};

const formatGenresOrStyles = (values) => values.map((value) => ({ name: value }));
