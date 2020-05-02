import React from 'react';
import PropTypes from 'prop-types';
import { ArtistContext } from '../../context/ArtistContext';
import { UserContext } from '../../context/UserContext';
import Message from '../Message/Message';
import SpotifyUpdateAlbum from '../SpotifyUpdateAlbum/SpotifyUpdateAlbum';
import CopyToClipboard from '../CopyToClipboard/CopyToClipboard';
import DropdownMenu from '../DropdownMenu/DropdownMenu';
import Button from '../Button/Button';
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

  handleShowDiscogsClick() {
    this.setState({
      showDiscogsForm: true,
      showRemoveForm: false
    });
  }

  handleHideDiscogsClick(event) {
    event.preventDefault();
    this.setState({
      showDiscogsForm: false
    });
  }

  handleRemoveSubmit(e) {
    e.preventDefault();
    this.props.deleteAlbum(this.props.album.id)
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
  renderAlbumCover(img_url) {
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
  renderDiscogsForm(albumId) {
    return (
      <div>
        <div className='album-minor-details'>
          <p><a href='' onClick={this.handleHideDiscogsClick}>&#xFF0D; Link to Discogs</a></p>
        </div>
        <ArtistContext.Consumer>
          {({ updateAlbum }) => <SpotifyUpdateAlbum id={albumId} {...{ updateAlbum }} />}
        </ArtistContext.Consumer>
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
  renderAlbumDetails(admin, showDiscogsForm, showRemoveForm, message, error) {
    const { name, id, release_date, total_tracks, added_at, spotify_id, discogs_id, genres, styles, bandcamp_url, youtube_url } = this.props.album;

    const dropdownList = discogs_id ? this.dropdownItems : this.dropdownItems.concat([{
      'label': 'Link to Discogs',
      'handleSelectedValue': this.handleShowDiscogsClick.bind(this)
    }]);

    return (
      <div>
        {admin && <div className='album-main'>
          <h2>{name}</h2>
          <DropdownMenu id={id} list={dropdownList} />
        </div>
        }
        <div className='album-main-details'>
          <p>{release_date.substr(0, 4)}&emsp;/&emsp;{total_tracks} tracks</p>
          {this.renderOpenLinks(spotify_id, bandcamp_url, youtube_url)}
          {spotify_id && this.renderCopyToClipboard(spotify_id)}
        </div>
        <div className='album-minor-details'>
          <p>{`Added on ${this.formatDate(added_at)}`}</p>
        </div>
        <div className='album-minor-details'>
          {this.renderGenresOrStyles(genres, 'Genres')}
          {this.renderGenresOrStyles(styles, 'Styles')}
        </div>
        {admin && !discogs_id && showDiscogsForm && this.renderDiscogsForm(id)}
        {admin && showRemoveForm && this.renderRemoveForm()}
        {admin && message && <Message message={message} error={error} />}
      </div>
    );
  }

  componentWillUpdate(nextProps) {
    if (!this.props.album) return;

    // If album has received a data update
    if (!this.props.album.hasOwnProperty('discogs_id') &&
      nextProps.album.hasOwnProperty('discogs_id')) {

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
    const { showDiscogsForm, showRemoveForm, message, error } = this.state;
    const { album: { img_url }, admin } = this.props;

    return (
      <div className='content-container'>
        <div className='album-wrapper'>
          <div className='album-cover-container'>
            {this.renderAlbumCover(img_url)}
          </div>
          <div className='album-detail-container'>
            {this.renderAlbumDetails(admin, showDiscogsForm, showRemoveForm, message, error)}
          </div>
        </div>
      </div>
    );
  }
}

Album.propTypes = {
  album: PropTypes.object.isRequired,
  admin: PropTypes.bool.isRequired,
  deleteAlbum: PropTypes.func.isRequired
};

const AlbumConsumer = (props) => {
  return (
    <UserContext.Consumer>
      {({ admin }) =>
        <ArtistContext.Consumer>
          {({ deleteAlbum }) => <Album {...props} {...{ deleteAlbum }} {...{ admin }} />}
        </ArtistContext.Consumer>
      }
    </UserContext.Consumer>
  );
}

export default AlbumConsumer;
