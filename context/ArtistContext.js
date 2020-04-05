import React from 'react';

export const ArtistContext = React.createContext({
  artist: null,
  deleteAlbum: () => { },
});