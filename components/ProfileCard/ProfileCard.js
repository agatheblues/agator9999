import React from 'react';
import PropTypes from 'prop-types';
require('../ProfileCard/ProfileCard.scss');

const ProfileCard = function ({ id, imgUrl, name, handleClick, totalAlbums, totalArtists }) {
  return (
    <div>
      <div className='profile-container'>
        <img alt='profile picture' src={imgUrl} className='profile-picture' />

        {id &&
          <div className='profile-id'>
            <p>Logged in Spotify as:</p>
            <p>{id}</p>
          </div>
        }

        {name && handleClick &&
          <div>
            <p className='profile-id'>{renderName(name)}</p>
            <a href='' className='profile-id profile--block' onClick={handleClick}>{'Logout \u{0219B}'}</a>
          </div>
        }
      </div>
      <p className='profile-counts'>{`${totalArtists} artists, ${totalAlbums} albums`}</p>
    </div>
  );
};

const renderName = function (name) {
  let words = name.split(' ');
  if (words.length == 1) {
    return 'Hello, ' + words[0] + '!';
  }

  if (words.length > 1) {
    return `Hello, ${words[0]} ${words[1].slice(0, 1)}.!`;
  }

  return 'Hello, unknown user!';
};

ProfileCard.propTypes = {
  id: PropTypes.string,
  name: PropTypes.string,
  imgUrl: PropTypes.string.isRequired,
  handleClick: PropTypes.func,
  totalArtists: PropTypes.number.isRequired,
  totalAlbums: PropTypes.number.isRequired,
};

export default ProfileCard;
