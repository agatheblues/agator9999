import React from 'react';
import PropTypes from 'prop-types';
import Button from '../Button/Button';
import Message from '../Message/Message.js';
import SpotifyLogin from '../SpotifyLogin/SpotifyLogin.js';
import SpotifyProfile from '../SpotifyProfile/SpotifyProfile';
import { Link } from 'react-router-dom';
import { getAccessToken } from '../../Helpers/SpotifyHelper.js';
require('./Synchronize.scss');

class Synchronize extends React.Component {

  constructor(props) {
    super();

    // Get accessToken
    this.accessToken = getAccessToken();

    // set local state
    this.state = {
      error: false,
      message: null
    };
  }


  render() {
    return (
      <div className='content-container'>

        <div className='back-to-library'>
          <Link to='/'>&#9839; Back to library</Link>
        </div>

        <h2>Synchronize your Spotify saved albums</h2>

        <div className='form-container'>
          {this.accessToken &&
            <div className='sync-container'>
              <SpotifyProfile />
              <Button
                label={'Synchronize'}
                handleClick={this.props.handleClick}
              />
            </div>
          }

          {!this.accessToken &&
            <SpotifyLogin redirect='spotify/sync'/>
          }

          {this.props.message &&
            <Message message={this.props.message} error={this.props.error}/>}
          <p className='note'>Synchronize saves all of your Spotify saved albums, and all of their artists to the database. It does not erase your current library but completes it.</p>

        </div>
      </div>
    );
  }
}

Synchronize.propTypes = {
  message: PropTypes.string,
  error: PropTypes.bool,
  handleClick: PropTypes.func.isRequired
};

export default Synchronize;
