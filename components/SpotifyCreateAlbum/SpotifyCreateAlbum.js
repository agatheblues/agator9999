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
      spotifyUri: 'spotify:album:2PVqtcY0gjunIwpcoJpjuZ',
      errorSubmit: false,
      errorSpotifyUri: null,
      discogsUri: 'https://www.discogs.com/El-Huervo-Do-Not-Lay-Waste-To-Homes/master/1035759',
      selectedReleaseType: 'master',
      errorDiscogsUri: null,
      messageSubmit: null,
      accessToken: this.accessToken,
      loaded: true
    };

    this.handleErrorSpotifyUri = this.handleErrorSpotifyUri.bind(this);
    this.handleErrorDiscogsUri = this.handleErrorDiscogsUri.bind(this);
    this.handleErrorReleaseType = this.handleErrorReleaseType.bind(this);
    this.handleValueFor = this.handleValueFor.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  /**
   * Extract album Spotify Id from spotify URI
   * @param  {String} s Spotify URI
   * @return {String}   Spotify ID
   */
  getSpotifyId(s) {
    return s.substring(14);
  }

  /**
   * Check that Spotify URI is correctly formatted
   * @param  {String} s Spotify URI
   * @return {String}   Error message
   */
  handleErrorSpotifyUri(s) {
    const msg = checkSpotifyUri(s);

    this.setState({
      errorSpotifyUri: msg
    });

    return msg;
  }

  /**
   * Check that Discogs URI is correctly formatted
   * @param  {String} s Discogs URI
   * @return {String}   Error message
   */
  handleErrorDiscogsUri(s) {
    const msg = checkDiscogsUri(s, this.state.selectedReleaseType);

    this.setState({
      errorDiscogsUri: msg
    });

    return msg;
  }

  /**
   * Check that Release Type is correctly formatted
   * @param  {String} s Release type
   * @return {String}   Error message
   */
  handleErrorReleaseType(type) {
    const msg = checkDiscogsUri(this.state.discogsUri, type);

    this.setState({
      errorDiscogsUri: msg
    });

    return msg;
  }

  /**
   * Handle Submit error
   * @param  {String} message Error message
   */
  handleSubmitError(message) {
    this.setState({
      errorSubmit: true,
      messageSubmit: message,
      loaded: true
    });
  }

  /**
   * Handle Submit Success
   */
  handleSubmitSuccess() {
    this.setState({
      errorSubmit: false,
      messageSubmit: 'Album successfully added to your library!',
      discogsUri: '',
      selectedReleaseType: 'placeholder',
      spotifyUri: '',
      loaded: true
    });
  }

  /**
   * Factory of handlers for input changes
   * @param  {String} label Input label
   * @return {function}     Handler for given input
   */
  handleValueFor(label) {

    const handleValue = (value) => {
      this.setState({
        [label]: value
      });
    };

    return handleValue;
  }

  /**
   * Get album from Spotify, save it to firebase if does not exists
   * Save or update artist to Firebase
   * Get artist images
   * Get Discogs Album
   * Update Spotify album with Discogs metadata
   */
  saveSpotifyAlbumToFirebase() {
    Promise.all([
      api.getAlbum(this.accessToken, this.getSpotifyId(this.state.spotifyUri)),
      dg.getRelease(this.state.discogsUri, this.state.selectedReleaseType)
    ])
      .then(function(values) {
        // Just in case
        if (values.length != 2) { throw({ message : 'Oops! Something went wrong while retrieving data from Spotify or Discogs.'});}

        // Add album
        const data = values.map(v => v.data);
        return fb.setAlbumIfNotExists(fb.formatSpotifyDiscogsAlbum(data[0], data[1]));
      })
      .then(() => this.handleSubmitSuccess())
      .catch((error) => this.handleSubmitError(error.message));

    // api.getAlbum(this.accessToken, this.getSpotifyId(this.state.spotifyUri))
    //   .then(({data}) => Promise.all([
    //     fb.setAlbumIfNotExists(fb.formatSpotifyAlbum(data)),
    //     fb.updateOrSetArtistsFromSingleAlbum(fb.formatArtists(data.artists, fb.formatSpotifyArtist), fb.formatSingleAlbumSummary(data))
    //       .then(() => api.getArtistsImages(this.accessToken, fb.getArtistIds(data.artists)))
    //   ]))
    //   .then(() => dg.getRelease(this.state.discogsUri, this.state.selectedReleaseType))
    //   .then(({data}) => {
    //     return fb.updateSpotifyAlbumWithDiscogsAlbum(this.getSpotifyId(this.state.spotifyUri), fb.formatDiscogsUpdateAlbum(data));
    //   })
    //   .then(() => this.handleSubmitSuccess())
    //   .catch((error) => this.handleSubmitError(error.message));
  }

  /**
   * Handle submit and check for errors in form
   * @param  {Event} event Submit event
   */
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

    this.saveSpotifyAlbumToFirebase();
  }

  render() {
    if (!this.accessToken) {
      return (
        <div>
          <p>You must login first.</p>
          <SpotifyLogin redirect='album/create' />
        </div>
      );
    }

    return (
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
              list={dg.releaseTypeList}
              id={'id'}
              value={'name'}
              selectedValue={dg.getReleaseType(this.state.selectedReleaseType)}
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
    );
  }
}

export default SpotifyCreateAlbum;
