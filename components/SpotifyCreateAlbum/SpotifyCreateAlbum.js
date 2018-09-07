import React from 'react';
import PropTypes from 'prop-types';
import * as api from '../../helpers/SpotifyHelper';
import * as dg from '../../helpers/DiscogsHelper';
import * as fb from '../../helpers/FirebaseHelper';
import Button from '../Button/Button';
import SpotifyLogin from '../SpotifyLogin/SpotifyLogin';
import Message from '../Message/Message';
import InputText from '../InputText/InputText';
import Dropdown from '../Dropdown/Dropdown';
import Loading from '../Loading/Loading';
import { checkSpotifyUri, checkDiscogsUri } from '../../helpers/ErrorHelper';

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
      discogsUri: '',
      selectedReleaseType: 'placeholder',
      errorDiscogsUri: null,
      messageSubmit: null,
      accessToken: this.accessToken,
      loaded: true
    };

    this.releaseTypeList = [
      {'id': 'placeholder', 'name': 'Select type', 'hide': true},
      {'id': 'master', 'name': 'Master'},
      {'id': 'release', 'name': 'Release'}
    ];

    this.handleErrorSpotifyUri = this.handleErrorSpotifyUri.bind(this);
    this.handleErrorDiscogsUri = this.handleErrorDiscogsUri.bind(this);
    this.handleErrorReleaseType = this.handleErrorReleaseType.bind(this);
    this.getReleaseType = this.getReleaseType.bind(this);
    this.handleValueFor = this.handleValueFor.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }


  getReleaseType(id) {
    return this.releaseTypeList.filter((s) => (s.id == id))[0].name;
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


  handleErrorDiscogsUri(s) {
    const msg = checkDiscogsUri(s, this.state.selectedReleaseType);

    this.setState({
      errorDiscogsUri: msg
    });

    return msg;
  }

  handleErrorReleaseType(type) {
    const msg = checkDiscogsUri(this.state.discogsUri, type);

    this.setState({
      errorDiscogsUri: msg
    });

    return msg;
  }

  handleError(message) {
    this.setState({
      errorSubmit: true,
      messageSubmit: message,
      loaded: true
    });
  }

  handleSuccess() {
    this.setState({
      errorSubmit: false,
      messageSubmit: 'Album successfully added to your library!',
      discogsUri: '',
      selectedReleaseType: 'placeholder',
      spotifyUri: '',
      loaded: true
    });
  }

  handleValueFor(label) {

    const handleValue = (value) => {
      this.setState({
        [label]: value
      });
    };

    return handleValue;
  }

  getArtistIds(artists) {
    return artists.map((artist) => artist.id);
  }

  handleSubmit(event) {
    event.preventDefault();

    const release = this.handleErrorReleaseType(this.state.selectedReleaseType);
    const discogs = this.handleErrorDiscogsUri(this.state.discogsUri);
    const spotify = this.handleErrorSpotifyUri(this.state.spotifyUri);

    if (spotify || release || discogs) {
      this.setState({
        errorSubmit: true,
        messageSubmit: 'There are errors in the form!'
      });

      return;
    }

    this.setState({
      errorSubmit: false,
      messageSubmit: null,
      loaded: false
    });

    // Set album, artist, and artist images
    api.getAlbum(this.accessToken, this.getSpotifyId(this.state.spotifyUri))
      .then(({data}) => Promise.all([
        fb.setAlbumIfNotExists(fb.formatSpotifyAlbum(data)),
        fb.updateOrSetArtistsFromSingleAlbum(fb.formatArtists(data.artists, fb.formatSpotifyArtist), fb.formatSingleAlbumSummary(data))
          .then(() => api.getArtistsImages(this.accessToken, this.getArtistIds(data.artists)))
      ]))
      .then(() => dg.getRelease(this.state.discogsUri, this.state.selectedReleaseType))
      .then(({data}) => {
        return fb.updateSpotifyAlbumWithDiscogsAlbum(this.getSpotifyId(this.state.spotifyUri), fb.formatDiscogsUpdateAlbum(data));
      })
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
                  handleValue={this.handleValueFor('spotifyUri')}
                  value={this.state.spotifyUri}
                />
              </div>

              {this.state.errorSpotifyUri &&
                <Message message={this.state.errorSpotifyUri} error={true} style={'input-msg'} />
              }

              <div className='form-row-container'>
                <Dropdown
                  list={this.releaseTypeList}
                  id={'id'}
                  value={'name'}
                  selectedValue={this.getReleaseType(this.state.selectedReleaseType)}
                  handleSelectedValue={this.handleValueFor('selectedReleaseType')}
                  handleError={this.handleErrorReleaseType}
                />
                <InputText
                  placeholder={'Discogs URL of album'}
                  handleValue={this.handleValueFor('discogsUri')}
                  handleError={this.handleErrorDiscogsUri}
                  value={this.state.discogsUri}
                />
              </div>

              <Message message={this.state.errorDiscogsUri} error={true} style={'input-msg'}/>

              {!this.state.loaded &&
                <Loading fullPage={false} label={'Creating album...'} />
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
