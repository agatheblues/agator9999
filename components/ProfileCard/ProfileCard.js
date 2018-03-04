import React from 'react';
import PropTypes from 'prop-types';
require('../ProfileCard/ProfileCard.scss');

const ProfileCard = ({id, imgUrl}) => (
  <div className='profileContainer'>
    <p className='profileId'>{id}</p>
    <img alt='profile picture' src={imgUrl} className='profilePicture'/>
  </div>
);

ProfileCard.propTypes = {
  id: PropTypes.string.isRequired,
  imgUrl: PropTypes.string.isRequired
};

export default ProfileCard;
