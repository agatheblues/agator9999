import React from 'react';
import PropTypes from 'prop-types';
require('../ProfileCard/ProfileCard.scss');

const ProfileCard = ({id, imgUrl}) => (
  <div className='profile-container'>
    <img alt='profile picture' src={imgUrl} className='profile-picture'/>
    <div className='profile-id'>
      <p>Logged in Spotify as:</p>
      <p>{id}</p>
    </div>
  </div>
);

ProfileCard.propTypes = {
  id: PropTypes.string.isRequired,
  imgUrl: PropTypes.string.isRequired
};

export default ProfileCard;
