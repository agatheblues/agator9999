import React from 'react';
import PropTypes from 'prop-types';
require('../ProfileCard/ProfileCard.scss');

const ProfileCard = ({id, imgUrl}) => (
  <div className='profileContainer'>
    <img alt='profile picture' src={imgUrl} className='profilePicture'/>
    <div className='profileId'>
      <p>Logged in as:</p>
      <p>{id}</p>
    </div>
  </div>
);

ProfileCard.propTypes = {
  id: PropTypes.string.isRequired,
  imgUrl: PropTypes.string.isRequired
};

export default ProfileCard;
