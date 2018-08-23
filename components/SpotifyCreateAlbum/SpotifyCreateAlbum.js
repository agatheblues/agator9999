import React from 'react';
import PropTypes from 'prop-types';
import Button from '../Button/Button';
import SpotifyLogin from '../SpotifyLogin/SpotifyLogin';
import Message from '../Message/Message';
import InputText from '../InputText/InputText';
import * as api from '../../helpers/SpotifyHelper';
import * as fb from '../../helpers/FirebaseHelper';
import {checkSpotifyUri} from '../../helpers/ErrorHelper';

class SpotifyCreateAlbum extends React.Component {
  constructor(props) {
    super();

    // Get accessToken
    this.accessToken = api.getAccessToken();

    // set local state
    this.state = {
      spotifyUri: '',
      errorSubmit: false,
      errorSpotifyUri: null,
      messageSubmit: null,
      accessToken: this.accessToken
    };

    this.handleErrorSpotifyUri = this.handleErrorSpotifyUri.bind(this);
    this.handleValue = this.handleValue.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  getSpotifyId(s) {
    return s.substring(14);
  }

  handleErrorSpotifyUri(s) {
    const msg = checkSpotifyUri(s);

    this.setState({
      errorSpotifyUri: msg
    });

    return msg;
  }

  handleError(message) {
    this.setState({
      errorSubmit: true,
      messageSubmit: message
    });
  }

  handleSuccess() {
    this.setState({
      errorSubmit: false,
      messageSubmit: 'Album successfully added to your library!'
    });
  }

  handleValue(value) {
    this.setState({
      spotifyUri: value
    });
  }

  getArtistIds(artists) {
    return artists.map((artist) => artist.id);
  }

  handleSubmit(event) {
    event.preventDefault();

    if (this.handleErrorSpotifyUri(this.state.spotifyUri)) {
      this.setState({
        errorSubmit: true,
        messageSubmit: 'There are errors in the form!'
      });

      return;
    }

    this.setState({
      errorSubmit: false,
      messageSubmit: null
    });

    // Set album, artist, and artist images
    api.getAlbum(this.accessToken, this.getSpotifyId(this.state.spotifyUri))
      .then(({data}) => Promise.all([
        fb.setAlbumIfNotExists(fb.formatSpotifyAlbum(data)),
        fb.updateOrSetArtistsFromSingleAlbum(fb.formatArtists(data.artists, fb.formatSpotifyArtist), fb.formatSingleAlbumSummary(data))
          .then(() => api.getArtistsImages(this.accessToken, this.getArtistIds(data.artists)))
      ]))
      .then(() => this.handleSuccess())
      .catch((error) => this.handleError(error.message));
  }

  render() {
    return (
      <div>
        {!this.accessToken &&
          <div>
            <p>You must login first.</p>
            <SpotifyLogin redirect='album/create' />
          </div>
        }
        {this.accessToken &&
          <div>
            <form onSubmit={this.handleSubmit}>
              <div className='form-row-container'>
                <InputText
                  handleError={this.handleErrorSpotifyUri}
                  placeholder='Spotify URI of the album as spotify:album:...'
                  handleValue={this.handleValue}
                  value={this.state.spotifyUri}
                />
              </div>

              {this.state.errorSpotifyUri &&
                <Message message={this.state.errorSpotifyUri} error={true} style={'input-msg'} />
              }

              {this.state.messageSubmit &&
                <Message message={this.state.messageSubmit} error={this.state.errorSubmit}/>
              }

              <div className='submit-container'>
                <Button label='OK' handleClick={this.handleSubmit}/>
              </div>
            </form>

            <p className='note'>To add an album from Spotify, fill in the Spotify URI of the album.</p>
          </div>
        }
      </div>
    );
  }
}

export default SpotifyCreateAlbum;
