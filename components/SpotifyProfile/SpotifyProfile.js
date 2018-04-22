import React from 'react';
import PropTypes from 'prop-types';
import ProfileCard from '../ProfileCard/ProfileCard';
import Message from '../Message/Message.js';
import * as api from '../../DataWrapper/SpotifyDataWrapper.js';


class SpotifyProfile extends React.Component {

  constructor(props) {
    super();

    // Get accessToken
    this.accessToken = api.getAccessToken();

    // set local state
    this.state = {
      hasProfileData: false,
      userId: '',
      imgUrl: '',
      error: false,
      message: null
    };

    this.handleProfileSuccess = this.handleProfileSuccess.bind(this);
    this.handleError = this.handleError.bind(this);
  }


  handleProfileSuccess(id, url) {
    this.setState({
      hasProfileData: true,
      userId: id,
      imgUrl: url
    });
  }

  handleError(message) {
    this.setState({
      'error': true,
      'message': message
    });
  }

  componentDidMount() {
    if (this.accessToken) {
      api.getProfile(this.accessToken, this.handleProfileSuccess, this.handleError);
    }
  }

  render() {
    return (
      <div>
        {this.state.message && <Message message={this.state.message} error={this.state.error}/>}
        {this.state.hasProfileData &&
            <ProfileCard id={this.state.userId} imgUrl={this.state.imgUrl} />
        }
      </div>
    );
  }
}


export default SpotifyProfile;
