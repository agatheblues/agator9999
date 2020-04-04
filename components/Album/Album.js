import React from 'react';
import PropTypes from 'prop-types';
import Message from '../Message/Message';
import SpotifyUpdateAlbum from '../SpotifyUpdateAlbum/SpotifyUpdateAlbum';
import CopyToClipboard from '../CopyToClipboard/CopyToClipboard';
import DropdownMenu from '../DropdownMenu/DropdownMenu';
import Button from '../Button/Button';
// import { removeAlbum } from '../../helpers/DataHelper';
require('./Album.scss');


class Album extends React.Component {

  constructor(props) {
    super();

    this.months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];

    this.timer = null;

    this.dropdownItems = [
      {
        'label': 'Remove album',
        'handleSelectedValue': this.handleShowRemoveClick.bind(this)
      }
    ];

    this.state = {
      error: false,
      album: props.album,
      showDiscogsForm: false,
      showRemoveForm: false,
      message: null,
    };

    this.handleHideDiscogsClick = this.handleHideDiscogsClick.bind(this);
    this.handleHideRemoveClick = this.handleHideRemoveClick.bind(this);
    this.handleRemoveSubmit = this.handleRemoveSubmit.bind(this);
    this.formatDate = this.formatDate.bind(this);
  }


  /**
   * Formats a date string to Month, YYYY
   * @param  {String} dateString Date
   * @return {String}            Formatted date
   */
  formatDate(dateString) {
    const date = new Date(dateString);
    let month = this.months[date.getMonth()];
    return month + ', ' + date.getFullYear();
  }

  handleShowRemoveClick() {
    this.setState({
      showRemoveForm: true,
      showDiscogsForm: false
    });
  }

  handleHideRemoveClick(event) {
    event.preventDefault();
    this.setState({
      showRemoveForm: false
    });
  }

  /**
   * On click, show the Link to Discogs form
   * @param  {Event} event Click event
   */
  handleShowDiscogsClick() {
    this.setState({
      showDiscogsForm: true,
      showRemoveForm: false
    });
  }

  /**
   * On click, hide the Link to Discogs form
   * @param  {Event} event Click event
   */
  handleHideDiscogsClick(event) {
    event.preventDefault();
    this.setState({
      showDiscogsForm: false
    });
  }

  handleRemoveError() {
    this.setState({
      error: true,
      message: 'Oops! Something went wrong while removing the album.'
    });
  }

  handleRemoveSubmit() {
    removeAlbum(this.props.artistId, this.props.id)
      .catch((error) => this.handleRemoveError());
  }

  /**
   * Renders Genres or Styles tags details
   * @param  {Array} values List of genres or styles objects
   * @param  {String} labelName    Title of the tags line
   * @return {String}              Genres or Styles Paragraph
   */
  renderGenresOrStyles(values, labelName) {
    if (values.length === 0) {
      return <p className='not-available'>{labelName} /</p>;
    }

    const list = values.map(v => v.name).join(', ');
    return <p>{labelName} / {list}</p>;
  }

  /**
   * Renders Album cover image or placeholder
   * @return {String} Album image markup
   */
  renderAlbumCover() {
    const { album: { img_url } } = this.state;

    const src = img_url ? img_url : '/static/images/missing-album.jpg';
    return <img src={src} alt={'Album Cover'} className='album-cover' />;
  }

  /**
   * Renders a CopyToClipboard component to copy spotify URI
   * @params {String} spotify_id
   * @return {String} CopyToClipboard component
   */
  renderCopyToClipboard(spotify_id) {
    return <CopyToClipboard value={`spotify:album:${spotify_id}`} />;
  }

  /**
   * Renders the Link to Discogs form is the user is admin, the album data has
   * loaded, and the album is not yet linked to a Discogs id.
   * @return {String} HTML Markup
   */
  renderDiscogsForm(spotify_id) {
    return (
      <div>
        <div className='album-minor-details'>
          <p><a href='' onClick={this.handleHideDiscogsClick}>&#xFF0D; Link to Discogs</a></p>
        </div>
        <SpotifyUpdateAlbum spotifyId={spotify_id} />
      </div>
    );
  }

  renderRemoveForm() {
    return (
      <div>
        <div className='album-minor-details'>
          <p><a href='' onClick={this.handleHideRemoveClick}>&#xFF0D; Remove album</a></p>
          <div className='form-container'>
            <p>Are you sure you want to remove this album?</p>
            <div className='submit-container'>
              <Button label={'Remove'} handleClick={this.handleRemoveSubmit} />
            </div>
          </div>
        </div>
      </div>
    );
  }

  renderOpenLink(url, source) {
    return (
      <p className='album-open-link'>
        <a href={url}
          target='_blank'
          rel='noopener noreferrer'>
          &#9836; <span>Open in {source}</span>
        </a>
      </p>
    );
  }

  renderOpenLinks(spotify_id, bandcamp_url, youtube_url) {
    return (
      <div>
        {
          spotify_id && this.renderOpenLink(
            `spotify:album:${spotify_id}`,
            'Spotify'
          )
        }
        {bandcamp_url && this.renderOpenLink(bandcamp_url, 'Bandcamp')}
        {youtube_url && this.renderOpenLink(youtube_url, 'Youtube')}
      </div>
    );
  }

  /**
   * Renders an Error Message is the album data has not loaded properly,
   * else render album details
   * @return {String} HTML Markup
   */
  renderAlbumDetails() {
    const { showDiscogsForm, showRemoveForm, album, message, error } = this.state;
    const { name, id, release_date, total_tracks, added_at, spotify_id, discogs_id, genres, styles } = album;

    const dropdownList = discogs_id ? this.dropdownItems : this.dropdownItems.concat([{
      'label': 'Link to Discogs',
      'handleSelectedValue': this.handleShowDiscogsClick.bind(this)
    }]);

    return (
      <div>
        <div className='album-main'>
          <h2>{name}</h2>
          <DropdownMenu id={id} list={dropdownList} />
        </div>
        <div className='album-main-details'>
          <p>{release_date.substr(0, 4)}&emsp;/&emsp;{total_tracks} tracks</p>
          {this.renderOpenLinks(spotify_id, 'fixme', 'fixme')}
          {spotify_id && this.renderCopyToClipboard(spotify_id)}
        </div>
        <div className='album-minor-details'>
          <p>{`Added on ${this.formatDate(added_at)}`}</p>
        </div>
        <div className='album-minor-details'>
          {this.renderGenresOrStyles(genres, 'Genres')}
          {this.renderGenresOrStyles(styles, 'Styles')}
        </div>
        {!discogs_id && showDiscogsForm && this.renderDiscogsForm(spotify_id)}
        {showRemoveForm && this.renderRemoveForm()}
        {message && <Message message={message} error={error} />}
      </div>
    );
  }

  componentWillUpdate(nextProps, nextState) {
    if (!this.state.album) return;

    // If album has received a data update
    if (!this.state.album.hasOwnProperty('discogs_id') &&
      nextState.album.hasOwnProperty('discogs_id')) {

      this.setState({
        error: false,
        message: 'Album successfully updated!'
      });

      // Timeout to hide success message
      this.timer = setTimeout(() => {
        this.setState({
          message: null
        });
      }, 2000);
    }
  }

  componentWillUnmount() {
    if (this.timer) {
      clearTimeout(this.timer);
    }
  }

  render() {
    return (
      <div className='content-container'>
        <div className='album-wrapper'>
          <div className='album-cover-container'>
            {this.renderAlbumCover()}
          </div>
          <div className='album-detail-container'>
            {this.renderAlbumDetails()}
          </div>
        </div>
      </div>
    );
  }
}

Album.propTypes = {
  artistId: PropTypes.string.isRequired,
  album: PropTypes.object.isRequired,
  isAdmin: PropTypes.bool.isRequired
};

export default Album;
