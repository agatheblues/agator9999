import React from 'react';
import PropTypes from 'prop-types';
import Button from '../Button/Button';
import ProfileCard from '../ProfileCard/ProfileCard';
import * as api from '../../DataWrapper/SpotifyDataWrapper.js';


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
      imgUrl: ''
    };

    this.handleClick = this.handleClick.bind(this);
    this.handleUpload = this.handleUpload.bind(this);
  }


  /**
   * Handle click button to request Spotify authentication
   */
  handleClick() {
    window.location = api.getLoginUrl();
  }

  componentDidMount() {
    if (this.accessToken && (this.urlState == null || this.urlState !== this.storedState)) {
      alert('There was an error during the authentication');
    } else {
      localStorage.removeItem(this.stateKey);

      if (this.accessToken) {

        this.instance.get('/me')
          .then((response) => {
            this.setState({
              hasProfileData: true,
              userId: response.data.id,
              imgUrl: response.data.images[0].url
            });
          })
          .catch((error) => {
            console.log(error);
          });
      }
    }
  }

  handleUpload() {
    console.log('handle upload');
    if (this.accessToken) {
      api.setAlbumsAndArtists(this.instance, 0, 50, this.props.db.database());
    }
  }

  render() {
    return (
      <div>
        {this.state.hasProfileData &&
          <div>
            <ProfileCard id={this.state.userId} imgUrl={this.state.imgUrl} />
            <Button
              label={'Upload your Spotify music'}
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
