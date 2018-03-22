import React from 'react';
import PropTypes from 'prop-types';
import Button from '../Button/Button';
import ProfileCard from '../ProfileCard/ProfileCard';
import ErrorMessage from '../ErrorMessage/ErrorMessage.js';
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
      imgUrl: '',
      error: false,
      errorMessage: ''
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
            let message = api.handleErrorMessage(error);

            this.setState({
              'error': true,
              'errorMessage': message
            });
          });
      }
    }
  }

  handleUpload() {
    if (this.accessToken) {
      this.setAlbumsAndArtists(this.instance, 0, 50, this.props.db.database());
    }
  }

  setAlbumsAndArtists(instance, offset, limit, db) {
    instance.get('/me/albms', {
      params: {
        limit: limit,
        offset: offset
      }
    })
      .then((response) => {
        fb.pushAlbums(response.data.items, db);
        fb.pushArtists(response.data.items, db);
      })
      .catch((error) => {
        let message = api.handleErrorMessage(error);

        this.setState({
          'error': true,
          'errorMessage': message
        });
      });

  }


  render() {
    return (
      <div>
        {this.state.error && <ErrorMessage message={this.state.errorMessage}/>}
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
