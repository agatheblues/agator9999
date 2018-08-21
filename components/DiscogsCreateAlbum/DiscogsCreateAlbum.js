import React from 'react';
import PropTypes from 'prop-types';
import Button from '../Button/Button';
import Message from '../Message/Message';
import Dropdown from '../Dropdown/Dropdown';
import InputText from '../InputText/InputText';
import SearchDropdown from '../SearchDropdown/SearchDropdown';
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
      selectedSource: 'placeholder',
      selectedReleaseType: 'placeholder',
      discogsUri: '',
      listeningUri: '',
      existingArtist: null,
      artists: []
    };

    this.sourceList = [
      {'id': 'placeholder', 'name': 'Select source', 'hide': true},
      {'id': 'bandcamp', 'name': 'Bandcamp'},
      {'id': 'youtube', 'name': 'Youtube'}
    ];

    this.releaseTypeList = [
      {'id': 'placeholder', 'name': 'Select type', 'hide': true},
      {'id': 'master', 'name': 'Master'},
      {'id': 'release', 'name': 'Release'}
    ];

    this.handleSubmit = this.handleSubmit.bind(this);
    this.checkDiscogsUri = this.checkDiscogsUri.bind(this);
    this.checkListeningUri = this.checkListeningUri.bind(this);
    this.handleValueFor = this.handleValueFor.bind(this);
    this.getSource = this.getSource.bind(this);
    this.getReleaseType = this.getReleaseType.bind(this);
  }

  getSource(id) {
    return this.sourceList.filter((s) => (s.id == id))[0].name;
  }

  getReleaseType(id) {
    return this.releaseTypeList.filter((s) => (s.id == id))[0].name;
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

    return (s.indexOf(this.state.selectedSource) == -1) ? 'URI should contain "' + this.state.selectedSource + '".' : null;
  }

  handleValueFor(label) {

    const handleValue = (value) => {
      this.setState({
        [label]: value
      });
    };

    return handleValue;
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
      message: 'Album successfully added to your library!',
      selectedSource: 'placeholder',
      selectedReleaseType: 'placeholder',
      discogsUri: '',
      listeningUri: ''
    });
  }

  handleArtistsListSuccess(artists) {
    this.setState({
      artists: artists
    });
  }

  getArtistsList() {
    fb.getArtists()
      .then((data) => this.handleArtistsListSuccess(fb.formatArtistList(data)))
      .catch((error) => this.handleError('Oops! Something went wrong while retrieving the artists'));

  }

  getArtistIds(artists) {
    return artists.map(artist => artist.id);
  }

  handleSubmit(event) {
    event.preventDefault();

    dg.getRelease(this.state.discogsUri, this.state.selectedReleaseType)
      .then(({data}) => {
        console.log('coucou', data);
        return Promise.all([
          fb.setAlbumIfNotExists(fb.formatDiscogsAlbum(data, this.state.selectedSource, this.state.listeningUri)),
          fb.updateOrSetArtistsFromSingleAlbum(fb.formatArtists(data.artists, fb.formatDiscogsArtist), fb.formatDiscogsSingleAlbumSummary(data))
            .then(() => dg.getArtistsImages(this.getArtistIds(data.artists)))
        ]);
      })
      .then(() => this.handleSuccess())
      .catch((error) => {
        console.log(error);
        this.handleError(error.message);
      });
  }

  componentDidMount() {
    this.getArtistsList();
  }

  render() {
    console.log(this.state);
    return (
      <div>
        <div>
          <p>To add an album from Discogs, copy the Url to the Id</p>
          <form onSubmit={this.handleSubmit}>
            <div className='form-row-container'>
              <label>Existing artist:</label>
              <SearchDropdown
                list={this.state.artists}
                id={'id'}
                value={'name'}
                placeholder={'Select an artist in your library'}
                handleValue={this.handleValueFor('existingArtist')}
              />
            </div>

            <div className='form-row-container'>
              <label>Discogs URI:</label>
              <Dropdown
                list={this.releaseTypeList}
                id={'id'}
                value={'name'}
                selectedValue={this.getReleaseType(this.state.selectedReleaseType)}
                handleSelectedValue={this.handleValueFor('selectedReleaseType')}
              />
              <InputText
                placeholder={'https://discogs.com/...'}
                setErrorMessage={this.checkDiscogsUri}
                handleValue={this.handleValueFor('discogsUri')}
                value={this.state.discogsUri}
              />
            </div>


            <div className='form-row-container'>
              <label>Listening URI:</label>
              <Dropdown
                list={this.sourceList}
                id={'id'}
                value={'name'}
                selectedValue={this.getSource(this.state.selectedSource)}
                handleSelectedValue={this.handleValueFor('selectedSource')}
              />
              <InputText
                setErrorMessage={this.checkListeningUri}
                handleValue={this.handleValueFor('listeningUri')}
                value={this.state.listeningUri}
              />
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
