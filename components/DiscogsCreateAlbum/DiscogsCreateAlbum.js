import React from 'react';
import PropTypes from 'prop-types';
import Button from '../Button/Button';
import Message from '../Message/Message';
import Dropdown from '../Dropdown/Dropdown';
import InputText from '../InputText/InputText';
import SearchDropdown from '../SearchDropdown/SearchDropdown';
import * as dg from '../../helpers/DiscogsHelper';
import * as fb from '../../helpers/FirebaseHelper';
import {checkDiscogsUri, checkListeningUri} from '../../helpers/ErrorHelper';
require('./DiscogsCreateAlbum.scss');

class DiscogsCreateAlbum extends React.Component {
  constructor(props) {
    super();

    // set local state
    this.state = {
      errorSubmit: false,
      messageSubmit: null,
      selectedSource: 'placeholder',
      selectedReleaseType: 'placeholder',
      discogsUri: '',
      listeningUri: '',
      errorDiscogsUri: null,
      errorListeningUri: null,
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
    this.handleErrorDiscogsUri = this.handleErrorDiscogsUri.bind(this);
    this.handleErrorListeningUri = this.handleErrorListeningUri.bind(this);
    this.handleErrorReleaseType = this.handleErrorReleaseType.bind(this);
    this.handleErrorSource = this.handleErrorSource.bind(this);
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


  /** Form inputs **/
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


  handleErrorListeningUri(s) {
    const msg = checkListeningUri(s, this.state.selectedSource);

    this.setState({
      errorListeningUri: msg
    });

    return msg;
  }


  handleErrorSource(source) {
    const msg = checkListeningUri(this.state.listeningUri, source);

    this.setState({
      errorListeningUri: msg
    });

    return msg;
  }

  hasErrors() {
    const source = this.handleErrorSource(this.state.selectedSource);
    const release = this.handleErrorReleaseType(this.state.selectedReleaseType);
    const discogs = this.handleErrorDiscogsUri(this.state.discogsUri);
    const listening = this.handleErrorListeningUri(this.state.listeningUri);

    return (source || release || discogs || listening);
  }

  handleValueFor(label) {

    const handleValue = (value) => {
      this.setState({
        [label]: value
      });
    };

    return handleValue;
  }


  /** Form submit **/
  handleSubmitError(message) {
    this.setState({
      errorSubmit: true,
      messageSubmit: message
    });
  }

  handleSubmitSuccess() {
    this.setState({
      errorSubmit: false,
      messageSubmit: 'Album successfully added to your library!',
      selectedSource: 'placeholder',
      selectedReleaseType: 'placeholder',
      discogsUri: '',
      listeningUri: ''
    });
  }


  /** Existing artists **/
  handleArtistsListSuccess(artists) {
    this.setState({
      artists: artists
    });
  }

  getArtistsList() {
    fb.getArtists()
      .then((data) => this.handleArtistsListSuccess(fb.formatArtistList(data)))
      .catch((error) => this.handleSubmitError('Oops! Something went wrong while retrieving the artists'));

  }

  getArtistIds(artists) {
    return artists.map(artist => artist.id);
  }

  handleSubmit(event) {
    event.preventDefault();

    // Check for errors
    if (this.hasErrors()) {
      this.setState({
        errorSubmit: true,
        messageSubmit: 'There are errors in the form!'
      });

      return;
    }

    // Reset error message
    this.setState({
      errorSubmit: false,
      messageSubmit: null
    });

    dg.getRelease(this.state.discogsUri, this.state.selectedReleaseType)
      .then(({data}) => {
        return Promise.all([
          fb.setAlbumIfNotExists(fb.formatDiscogsAlbum(data, this.state.selectedSource, this.state.listeningUri)),
          fb.updateOrSetArtistsFromSingleAlbum(fb.formatArtists(data.artists, fb.formatDiscogsArtist), fb.formatDiscogsSingleAlbumSummary(data))
            .then(() => dg.getArtistsImages(this.getArtistIds(data.artists)))
        ]);
      })
      .then(() => this.handleSubmitSuccess())
      .catch((error) => {
        this.handleSubmitError(error.message);
      });
  }

  componentDidMount() {
    this.getArtistsList();
  }

  render() {
    // <div className='form-row-container'>
    //   <label>Existing artist:</label>
    //   <SearchDropdown
    //     list={this.state.artists}
    //     id={'id'}
    //     value={'name'}
    //     placeholder={'Select an artist in your library'}
    //     handleValue={this.handleValueFor('existingArtist')}
    //   />
    // </div>
    return (
      <div>
        <div>
          <form onSubmit={this.handleSubmit}>


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
                placeholder={'Discogs URL of the master or release album'}
                handleValue={this.handleValueFor('discogsUri')}
                handleError={this.handleErrorDiscogsUri}
                value={this.state.discogsUri}
              />
            </div>

            <Message message={this.state.errorDiscogsUri} error={true} style={'input-msg'}/>


            <div className='form-row-container'>
              <Dropdown
                list={this.sourceList}
                id={'id'}
                value={'name'}
                selectedValue={this.getSource(this.state.selectedSource)}
                handleSelectedValue={this.handleValueFor('selectedSource')}
                handleError={this.handleErrorSource}
              />
              <InputText
                placeholder={'Bandcamp or Youtube URL of the album'}
                handleValue={this.handleValueFor('listeningUri')}
                handleError={this.handleErrorListeningUri}
                value={this.state.listeningUri}
              />
            </div>

            <Message message={this.state.errorListeningUri} error={true} style={'input-msg'}/>

            {this.state.messageSubmit &&
              <Message message={this.state.messageSubmit} error={this.state.errorSubmit}/>
            }

            <div className='submit-container'>
              <Button label='OK' handleClick={this.handleSubmit}/>
            </div>

            <p className='note'>To add an album from Discogs, fill in the release or master url of the album on Discogs, and the Youtube or Bandcamp url of where the album can be streamed.</p>
          </form>
        </div>
      </div>
    );
  }
}


export default DiscogsCreateAlbum;
