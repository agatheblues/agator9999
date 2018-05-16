import React from 'react';
import PropTypes from 'prop-types';
import Button from '../Button/Button';
import Message from '../Message/Message.js';
import { getLoginUrl, authenticate } from '../../Helpers/SpotifyHelper.js';


class SpotifyLogin extends React.Component {

  constructor(props) {
    super();

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
    window.location = getLoginUrl(this.props.redirect);
  }

  handleError(message) {
    this.setState({
      'error': true,
      'message': message
    });
  }

  componentDidMount() {
    authenticate(this.handleError);
  }

  render() {
    return (
      <div>
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
