import React from 'react';
import { getAccessToken } from '../../helpers/SpotifyHelper';
import * as dg from '../../helpers/DiscogsHelper';
import { createSpotifyDiscogsAlbum } from '../../helpers/DataHelper';
import Button from '../Button/Button';
import SpotifyLogin from '../SpotifyLogin/SpotifyLogin';
import Message from '../Message/Message';
import InputText from '../InputText/InputText';
import Dropdown from '../Dropdown/Dropdown';
import Loading from '../Loading/Loading';
import { checkSpotifyUri, checkDiscogsUri } from '../../helpers/ErrorHelper';

class SpotifyCreateAlbum extends React.Component {
  constructor() {
    super();

    // Get accessToken
    this.accessToken = getAccessToken();

    // set local state
    this.state = {
      spotifyUri: 'spotify:album:59GRmAvlGs7KjLizFnV7Y9',
      errorSubmit: false,
      errorSpotifyUri: null,
      discogsUri: 'https://www.discogs.com/Thundercat-It-Is-What-It-Is/master/1709557',
      selectedReleaseType: 'master', // 'placeholder',
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
  handleSubmitError(error) {
    this.setState({
      errorSubmit: true,
      messageSubmit: error.data.message,
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
   * Create an album based on spotify and discogs data.
   */
  createAlbum() {
    const token = this.accessToken;
    const { selectedReleaseType, spotifyUri, discogsUri } = this.state;

    createSpotifyDiscogsAlbum(spotifyUri, discogsUri, selectedReleaseType, token)
      .then(() => this.handleSubmitSuccess())
      .catch((error) => this.handleSubmitError(error.response));
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

    this.createAlbum();
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

          <Message message={this.state.errorDiscogsUri} error={true} style={'input-msg'} />

          {!this.state.loaded &&
            <Loading fullPage={false} label={'Creating album...'} />
          }

          {this.state.messageSubmit &&
            <Message message={this.state.messageSubmit} error={this.state.errorSubmit} />
          }

          <div className='submit-container'>
            <Button label='OK' handleClick={this.handleSubmit} />
          </div>
        </form>

        <p className='note'>To add an album from Spotify, fill in the Spotify URI of the album.</p>
      </div>
    );
  }
}

export default SpotifyCreateAlbum;
