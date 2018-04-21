import React from 'react';
import PropTypes from 'prop-types';
import Button from '../Button/Button';
import Message from '../Message/Message.js';
import config from '../../config.json';
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
      error: false,
      message: null
    };

    this.handleClick = this.handleClick.bind(this);
    this.handleError = this.handleError.bind(this);
  }


  /**
   * Handle click button to request Spotify authentication
   */
  handleClick() {
    window.location = api.getLoginUrl(this.props.redirect);
  }

  handleError(message) {
    this.setState({
      'error': true,
      'message': message
    });
  }

  componentDidMount() {
    if (this.accessToken && (this.urlState == null || this.urlState !== this.storedState)) {

      this.handleError('There was an error during the authentication');

    } else {

      if (this.accessToken && this.storedState) {
        api.setAccessToken(this.accessToken);
        window.location = '/#/' + this.storedState;
        api.removeStateKey();
      }

    }
  }

  render() {
    return (
      <div  className='content-container'>
        {this.state.message && <Message message={this.state.message} error={this.state.error}/>}
        <Button
          label={'Log in with Spotify'}
          handleClick={this.handleClick}
        />
      </div>
    );
  }
}

SpotifyLogin.propTypes = {
  redirect: PropTypes.string
};


export default SpotifyLogin;
