import React from 'react';
import PropTypes from 'prop-types';
import ProfileCard from '../ProfileCard/ProfileCard';
import Message from '../Message/Message.js';
import {getAccessToken, getProfile, handleErrorMessage} from '../../Helpers/SpotifyHelper.js';


class SpotifyProfile extends React.Component {

  constructor(props) {
    super();

    // Get accessToken
    this.accessToken = getAccessToken();

    // set local state
    this.state = {
      hasProfileData: false,
      userId: '',
      imgUrl: '',
      error: false,
      message: null
    };
  }


  handleSuccess(id, url) {
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
      getProfile(this.accessToken)
        .then((response) => {
          this.handleSuccess(response.data.id,  response.data.images[0].url);
        })
        .catch((error) => {
          this.handleError(handleErrorMessage(error));
        });
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
