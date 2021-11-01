import React from 'react';
import * as discogs from '../../helpers/DiscogsHelper';
import { createDiscogsAlbum } from '../../helpers/DataHelper';
import { checkDiscogsUri, checkListeningUri } from '../../helpers/ErrorHelper';
import Button from '../Button/Button';
import Message from '../Message/Message';
import Dropdown from '../Dropdown/Dropdown';
import InputText from '../InputText/InputText';
import Loading from '../Loading/Loading';
require('./DiscogsCreateAlbum.scss');

class DiscogsCreateAlbum extends React.Component {
  constructor() {
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
      artists: [],
      loaded: true
    };

    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleErrorDiscogsUri = this.handleErrorDiscogsUri.bind(this);
    this.handleErrorListeningUri = this.handleErrorListeningUri.bind(this);
    this.handleErrorReleaseType = this.handleErrorReleaseType.bind(this);
    this.handleErrorSource = this.handleErrorSource.bind(this);
    this.handleValueFor = this.handleValueFor.bind(this);
  }

  /**
   * Handle input error of Discogs URI input text
   * @param  {String} s Discogs uri
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
   * Handle input error of Discogs Release type dropdown
   * @param  {String} type Discogs selected release type
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
   * Handle input error of Listening URI input text
   * @param  {String} s listening uri
   * @return {String}   Error message
   */
  handleErrorListeningUri(s) {
    const msg = checkListeningUri(s, this.state.selectedSource);

    this.setState({
      errorListeningUri: msg
    });

    return msg;
  }

  /**
   * Handle input error of Listening URI source dropdown
   * @param  {String} source Listening URI source
   * @return {String}   Error message
   */
  handleErrorSource(source) {
    const msg = checkListeningUri(this.state.listeningUri, source);

    this.setState({
      errorListeningUri: msg
    });

    return msg;
  }

  /**
   * Checks if the form has any user input errors
   * @return {Boolean} True if has at least one error
   */
  hasErrors() {
    const source = this.handleErrorSource(this.state.selectedSource);
    const release = this.handleErrorReleaseType(this.state.selectedReleaseType);
    const discogs = this.handleErrorDiscogsUri(this.state.discogsUri);
    const listening = this.handleErrorListeningUri(this.state.listeningUri);

    return (source || release || discogs || listening);
  }

  /**
   * Returns a function that handle value changes of forms inputs
   * @param  {String} label input label
   * @return {function}     handler for the given input
   */
  handleValueFor(label) {
    return (value) => {
      this.setState({
        [label]: value
      });
    };
  }

  /**
   * Handle form submit error
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
   * Handle form submit success
   */
  handleSubmitSuccess() {
    this.setState({
      errorSubmit: false,
      messageSubmit: 'Album successfully added to your library!',
      selectedSource: 'placeholder',
      selectedReleaseType: 'placeholder',
      discogsUri: '',
      listeningUri: '',
      loaded: true
    });
  }

  createAlbum() {
    const { discogsUri, selectedReleaseType, selectedSource, listeningUri } = this.state;

    createDiscogsAlbum(discogsUri, selectedReleaseType, selectedSource, listeningUri)
      .then(() => this.handleSubmitSuccess())
      .catch((error) => this.handleSubmitError(error.response));
  }

  /**
   * Handle Form Submit Event
   * @param  {Event} event SUbmit event
   */
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
      messageSubmit: null,
      loaded: false
    });

    this.createAlbum();
  }

  render() {
    return (
      <div>
        <div>
          <form onSubmit={this.handleSubmit}>
            <div className='form-row-container'>
              <Dropdown
                list={discogs.sourceList}
                id={'id'}
                value={'name'}
                selectedValue={discogs.getSource(this.state.selectedSource)}
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
            <Message message={this.state.errorListeningUri} error={true} style={'input-msg'} />

            <div className='form-row-container'>
              <Dropdown
                list={discogs.releaseTypeList}
                id={'id'}
                value={'name'}
                selectedValue={discogs.getReleaseType(this.state.selectedReleaseType)}
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

            <p className='note'>To add an album from Discogs, fill in the release or master url of the album on Discogs, and the Youtube or Bandcamp url of where the album can be streamed.</p>
          </form>
        </div>
      </div>
    );
  }
}


export default DiscogsCreateAlbum;
