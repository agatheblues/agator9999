import React from 'react';

export const ArtistMergeContext = React.createContext({
  originArtist: null,
  artists: [],
  mergeArtists: () => { }
});