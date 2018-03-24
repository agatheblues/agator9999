import React from 'react';
import PropTypes from 'prop-types';
import Button from '../Button/Button';
import ProfileCard from '../ProfileCard/ProfileCard';
import Message from '../Message/Message.js';
import * as api from '../../DataWrapper/SpotifyDataWrapper.js';
import * as fb from '../../DataWrapper/FirebaseDataWrapper.js';


class SpotifyLogin extends React.Component {

  constructor(props) {
    super();

    this.storedState = api.getStateKey();

    // URL dependencies
    this.params = api.getHashParams();
    this.accessToken = this.params.access_token;
    this.urlState = this.params.state;

    // Axios instance
    this.instance = api.getInstance(this.accessToken);

    // set local state
    this.state = {
      hasProfileData: false,
      userId: '',
      imgUrl: '',
      error: false,
      message: null
    };

    this.handleClick = this.handleClick.bind(this);
    this.handleUpload = this.handleUpload.bind(this);
    this.handleSyncSuccess = this.handleSyncSuccess.bind(this);
    this.handleProfileSuccess = this.handleProfileSuccess.bind(this);
    this.handleError = this.handleError.bind(this);
  }


  /**
   * Handle click button to request Spotify authentication
   */
  handleClick() {
    window.location = api.getLoginUrl();
  }

  handleSyncSuccess() {
    this.setState({
      'error': false,
      'message': 'Upload successful!'
    });
  }

  handleProfileSuccess(id, url) {
    this.setState({
      hasProfileData: true,
      userId: id,
      imgUrl:url
    });
  }

  handleError(message) {
    this.setState({
      'error': true,
      'message': message
    });
  }

  componentDidMount() {
    if (this.accessToken && (this.urlState == null || this.urlState !== this.storedState)) {
      alert('There was an error during the authentication');
    } else {
      localStorage.removeItem(this.stateKey);

      if (this.accessToken) {
        api.getProfile(this.instance, this.handleProfileSuccess, this.handleError);
      }
    }
  }

  handleUpload() {
    if (this.accessToken) {
      api.setAlbumsAndArtists(this.instance, 0, 50, this.props.db, this.handleSyncSuccess, this.handleError);
    }
  }




  render() {
    return (
      <div>
        {this.state.message && <Message message={this.state.message} error={this.state.error}/>}
        {this.state.hasProfileData &&
          <div>
            <ProfileCard id={this.state.userId} imgUrl={this.state.imgUrl} />
            <Button
              label={'Sync your Spotify music'}
              handleClick={this.handleUpload}
            />
          </div>
        }
        {!this.state.hasProfileData &&
          <Button
            label={'Log in with Spotify'}
            handleClick={this.handleClick}
          />
        }
      </div>
    );
  }
}

SpotifyLogin.propTypes = {
  db: PropTypes.object.isRequired
};


export default SpotifyLogin;
