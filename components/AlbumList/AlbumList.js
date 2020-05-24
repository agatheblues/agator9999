import React from 'react';
import PropTypes from 'prop-types';
import Album from '../Album/Album';
import Button from '../Button/Button';
import EmptyList from '../EmptyList/EmptyList';


const AlbumList = ({ albums }) => {
  if (albums.length === 0) {
    return (
      <div className='content-container'>
        <EmptyList message='This artist does not have any albums.' />
        <div className='submit-container submit-container--center'>
          <Button label='Remove artist' handleClick={this.handleRemoveSubmit} />
        </div>
      </div>
    );
  }

  return albums.map((album, index) =>
    <Album key={index} album={album} />
  );
}

AlbumList.propTypes = {
  albums: PropTypes.array.isRequired
};

export default AlbumList;
