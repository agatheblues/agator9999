import React from 'react';
import PropTypes from 'prop-types';
import Button from '../Button/Button';
import Message from '../Message/Message';
import InputText from '../InputText/InputText';
import Dropdown from '../Dropdown/Dropdown';
import * as dg from '../../helpers/DiscogsHelper';
import * as fb from '../../helpers/FirebaseHelper';
import {checkDiscogsUri} from '../../helpers/ErrorHelper';

class SpotifyUpdateAlbum extends React.Component {
  constructor(props) {
    super();

    this.state = {
      discogsUri: '',
      selectedReleaseType: 'placeholder',
      errorSubmit: false,
      errorDiscogsUri: null,
      messageSubmit: null
    };

    this.handleValueFor = this.handleValueFor.bind(this);
    this.handleErrorDiscogsUri = this.handleErrorDiscogsUri.bind(this);
    this.handleErrorReleaseType = this.handleErrorReleaseType.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }


  handleValueFor(label) {

    const handleValue = (value) => {
      this.setState({
        [label]: value
      });
    };

    return handleValue;
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

  handleSubmitError(message) {
    this.setState({
      errorSubmit: true,
      messageSubmit: message
    });
  }

  handleSubmitSuccess() {
    this.setState({
      errorSubmit: false,
      messageSubmit: 'Album successfully updated!'
    });
  }

  updateSpotifyAlbum() {
    dg.getRelease(this.state.discogsUri, this.state.selectedReleaseType)
      .then(({data}) => {
        return fb.updateSpotifyAlbumWithDiscogsAlbum(this.props.spotifyId, fb.formatDiscogsUpdateAlbum(data));
      })
      .then(() => this.handleSubmitSuccess())
      .catch((error) => {
        this.handleSubmitError(error.message);
      });
  }

  handleSubmit(event) {
    event.preventDefault();

    const release = this.handleErrorReleaseType(this.state.selectedReleaseType);
    const discogs = this.handleErrorDiscogsUri(this.state.discogsUri);

    if (release || discogs) {
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

    this.updateSpotifyAlbum();
  }

  render() {
    return (
      <div className='form-container'>
        <form onSubmit={this.handleSubmit}>
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

          {this.state.messageSubmit &&
            <Message message={this.state.messageSubmit} error={this.state.errorSubmit}/>
          }

          <div className='submit-container'>
            <Button label='OK' handleClick={this.handleSubmit}/>
          </div>

          <p className='note'>To link a Spotify album to its Discogs equivalent, fill in the release or master url of the album on Discogs.</p>

        </form>
      </div>
    );
  }
}

SpotifyUpdateAlbum.propTypes = {
  spotifyId: PropTypes.string.isRequired
};


export default SpotifyUpdateAlbum;
