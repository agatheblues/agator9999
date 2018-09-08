import React from 'react';
import PropTypes from 'prop-types';
import ProfileCard from '../ProfileCard/ProfileCard';
import Message from '../Message/Message.js';
import {getAccessToken, getProfile, handleErrorMessage} from '../../helpers/SpotifyHelper.js';


class SpotifyProfile extends React.Component {

  constructor(props) {
    super();

    this.accessToken = getAccessToken();

    this.state = {
      hasProfileData: false,
      userId: '',
      imgUrl: '',
      error: false,
      message: null
    };
  }

  /**
   * Handle fetching Spotify Profile success
   * @param  {String} id  User id
   * @param  {String} url Profile image url
   */
  handleGetProfileSuccess(id, url) {
    this.setState({
      hasProfileData: true,
      userId: id,
      imgUrl: url
    });
  }

  /**
   * Handle fetching Spotify Profile error
   * @param  {String} message Error message
   */
  handleGetProfileError(message) {
    this.setState({
      'error': true,
      'message': message
    });
  }

  componentDidMount() {
    if (this.accessToken) {
      getProfile(this.accessToken)
        .then((response) => {
          const url = (response.data.images.length == 0) ? '../static/images/missing.jpg' : response.data.images[0].url;
          this.handleGetProfileSuccess(response.data.id, url);
        })
        .catch((error) => {
          this.handleGetProfileError(handleErrorMessage(error));
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
