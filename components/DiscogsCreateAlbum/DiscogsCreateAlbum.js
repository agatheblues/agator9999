import React from 'react';
import PropTypes from 'prop-types';
import Button from '../Button/Button';
import Message from '../Message/Message';
import Dropdown from '../Dropdown/Dropdown';
import InputText from '../InputText/InputText';
import * as dg from '../../helpers/DiscogsHelper';
import * as fb from '../../helpers/FirebaseHelper';
require('./DiscogsCreateAlbum.scss');

class DiscogsCreateAlbum extends React.Component {
  constructor(props) {
    super();

    // set local state
    this.state = {
      error: false,
      message: null,
      selectedSource: null,
      selectedReleaseType: null
    };

    this.sourceList = [
      {'id': 'bandcamp', 'name': 'Bandcamp'},
      {'id': 'youtube', 'name': 'Youtube'}
    ];

    this.releaseTypeList = [
      {'id': 'master', 'name': 'Master'},
      {'id': 'release', 'name': 'Release'}
    ];

    this.handleSubmit = this.handleSubmit.bind(this);
    this.checkDiscogsUri = this.checkDiscogsUri.bind(this);
    this.checkListeningUri = this.checkListeningUri.bind(this);
    this.handleSelectedSource = this.handleSelectedSource.bind(this);
    this.handleSelectedReleaseType = this.handleSelectedReleaseType.bind(this);
  }

  checkDiscogsUri(s) {

    if (!this.state.selectedReleaseType) {
      return 'Please provide a release type!';
    } else if (s.indexOf('https://www.discogs.com/') != 0) {
      return 'URI should start with https://discogs.com/...';
    } else if (s.indexOf(this.state.selectedReleaseType) == -1) {
      return 'URI should contain ' + this.state.selectedReleaseType + '.';
    }

    return null;
  }


  checkListeningUri(s) {

    if (!this.state.selectedSource) {
      return 'Please provide a source!';
    }

    return (s.indexOf(this.state.selectedSource.id) == -1) ? 'URI should contain "' + this.state.selectedSource.id + '".' : null;
  }

  handleSelectedSource(value) {
    this.setState({
      selectedSource: value
    });
  }

  handleSelectedReleaseType(value) {
    this.setState({
      selectedReleaseType: value
    });
  }

  handleError(message) {
    this.setState({
      error: true,
      message: message
    });
  }

  handleSuccess() {
    this.setState({
      error: false,
      message: 'Album successfully added to your library!'
    });
  }

  handleSubmit(event) {
    event.preventDefault();

    dg.getRelease(this.state.value, 'master')
      .then(({data}) => {
        console.log('coucou', data);
        return fb.setAlbumIfNotExists(fb.formatDiscogsAlbum(data));
      });
    // // Set album, artist, and artist images
    // api.getAlbum(this.accessToken, this.getSpotifyId(this.state.value))
    //   .then(({data}) => Promise.all([
    //     fb.setAlbumIfNotExists(fb.formatAlbum(data)),
    //     fb.updateOrSetArtistsFromSingleAlbum(fb.formatArtists(data.artists), fb.formatSingleAlbumSummary(data))
    //       .then(() => api.getArtistsImages(this.accessToken, this.getArtistIds(data.artists)))
    //   ]))
    //   .then(() => this.handleSuccess())
    //   .catch((error) => this.handleError(error.message));
  }

  render() {
    console.log(this.state);
    return (
      <div>
        <div>
          <p>To add an album from Discogs, copy the Url to the Id</p>
          <form onSubmit={this.handleSubmit}>
            <div className='form-row-container'>
              <label>Discogs URI:</label>
              <Dropdown
                list={this.releaseTypeList}
                id={'id'}
                value={'name'}
                placeholder={'Select type'}
                handleSelectedValue={this.handleSelectedReleaseType}
              />
              <InputText placeholder={'https://discogs.com/...'} setErrorMessage={this.checkDiscogsUri}/>
            </div>


            <div className='form-row-container'>
              <label>Listening URI:</label>
              <Dropdown
                list={this.sourceList}
                id={'id'}
                value={'name'}
                placeholder={'Select source'}
                handleSelectedValue={this.handleSelectedSource}
              />
              <InputText setErrorMessage={this.checkListeningUri}/>
            </div>

            {this.state.message &&
              <Message message={this.state.message} error={this.state.error}/>
            }

            <div className='submit-container'>
              <Button label='OK' handleClick={this.handleSubmit}/>
            </div>
          </form>
        </div>
      </div>
    );
  }
}


export default DiscogsCreateAlbum;
