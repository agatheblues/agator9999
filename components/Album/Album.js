import React from 'react';
import PropTypes from 'prop-types';
import Message from '../Message/Message';
import SpotifyUpdateAlbum from '../SpotifyUpdateAlbum/SpotifyUpdateAlbum';
import CopyToClipboard from '../CopyToClipboard/CopyToClipboard';
import { getRef } from '../../helpers/FirebaseHelper';
require('./Album.scss');

class Album extends React.Component {

  constructor(props) {
    super();

    this.months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];

    this.timer = null;

    this.state = {
      error: false,
      hasAlbumData: false,
      albumData: null,
      showDiscogsForm: false,
      messageUpdateSuccess: null
    };

    this.handleShowDiscogsClick = this.handleShowDiscogsClick.bind(this);
    this.handleHideDiscogsClick = this.handleHideDiscogsClick.bind(this);
  }


  /**
   * Formats a date string to Month, YYYY
   * @param  {String} dateString Date, as saved in FB
   * @return {String}            Formatted date
   */
  formatDate(dateString) {
    const date = new Date(dateString);
    let month = this.months[date.getMonth()];
    return month + ', ' + date.getFullYear();
  }


  /**
   * On successful album retrieval from firebase, set album to state
   * @param  {Object} album Album, from Firebase
   */
  handleGetAlbumSuccess(album) {
    album.added_at = this.formatDate(album.added_at);
    album.release_date = album.release_date.substr(0, 4); // Get year only

    this.setState({
      hasAlbumData: true,
      albumData: album,
      showDiscogsForm: false
    });
  }


  /**
   * On click, show the Link to Discogs form
   * @param  {Event} event Click event
   */
  handleShowDiscogsClick(event) {
    event.preventDefault();

    this.setState({
      showDiscogsForm: true
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

  /**
   * Parses the Genre or Style array and generates a string in this form:
   * MyAccumulator / Genre1, Genre2, Genre3
   * @param  {string} accumulator  Label of the genre/style
   * @param  {string} currentValue Value of genre or style
   * @param  {int} currentIndex    Index of genre or style
   * @param  {Array} array         Genres or styles array
   * @return {String}              Concatenated genres or styles list
   */
  genreStyleReducer(accumulator, currentValue, currentIndex, array) {
    if (currentIndex == array.length - 1) {
      return accumulator + ' ' + currentValue;
    }

    return accumulator + ' ' + currentValue + ',';
  }

  /**
   * Renders Genres or Styles tags details
   * @param  {String} propertyName Name of the tag type in albumData object
   * @param  {String} labelName    Title of the tags line
   * @return {String}              Genres or Styles Paragraph
   */
  renderGenresOrStyles(propertyName, labelName) {
    if (!this.state.albumData.hasOwnProperty(propertyName) ||
       (this.state.albumData.genres.length == 0)) {
      return <p className='not-available'>{`${labelName} /`}</p>;
    }

    return <p>{this.state.albumData[propertyName].reduce(this.genreStyleReducer, labelName + ' /')}</p>;
  }

  /**
   * Renders Album cover image or placeholder
   * @return {String} Album image markup
   */
  renderAlbumCover() {
    if (!this.state.hasAlbumData) return null;
    const hasImage = this.state.albumData.hasOwnProperty('images') && this.state.albumData.images.imgUrl;
    let src = hasImage ? this.state.albumData.images.imgUrl :  '/static/images/missing-album.jpg';

    return <img src={src} alt={'Album Cover'} className='album-cover'/>;
  }

  /**
   * Renders a CopyToClipboard component to copy spotify URI
   * @return {String} CopyToClipboard component
   */
  renderCopyToClipboard() {
    if (!this.state.albumData.sources.hasOwnProperty('spotify')) return null;
    return <CopyToClipboard value={`spotify:album:${this.state.albumData.sources.spotify}`}/>;
  }

  /**
   * Renders the Link to Discogs form is the user is admin, the album data has
   * loaded, and the album is not yet linked to a Discogs id.
   * @return {String} HTML Markup
   */
  renderDiscogsForm() {
    if (!this.props.isAdmin) return null;
    if (!this.state.hasAlbumData) return null;
    if (this.state.albumData.sources.hasOwnProperty('discogs')) return null;
    if (!this.state.showDiscogsForm) {
      return (
        <div className='album-minor-details'>
          <p><a href='' onClick={this.handleShowDiscogsClick}>&#xFF0B; Link to Discogs</a></p>
        </div>
      );
    }

    return (
      <div>
        <div className='album-minor-details'>
          <p><a href='' onClick={this.handleHideDiscogsClick}>&#xFF0D; Link to Discogs</a></p>
        </div>
        <SpotifyUpdateAlbum spotifyId={this.state.albumData.sources.spotify} />
      </div>
    );
  }

  renderOpenLink() {
    if (this.state.albumData.sources.hasOwnProperty('spotify')) {
      return (
        <p className='album-open-link'>
          <a href={`https://open.spotify.com/go?uri=spotify:album:${this.state.albumData.sources.spotify}`}
            target='_blank'
            rel='noopener noreferrer'>&#9836; Open in <span className='capitalize'>spotify</span>
          </a>
        </p>
      );
    }

    return (
      <p className='album-open-link'>
        <a href={this.state.albumData.url}
          target='_blank'
          rel='noopener noreferrer'>&#9836; Open in <span className='capitalize'>{this.state.albumData.streamingSource}</span>
        </a>
      </p>
    );

  }

  /**
   * Renders an Error Message is the album data has not loaded properly,
   * else render album details
   * @return {String} HTML Markup
   */
  renderAlbumDetails() {
    if (!this.state.hasAlbumData) return null;
    if (this.state.error) return <Message
      message='Oops! There was a problem while retrieving data for this album.'
      error={this.state.error}
    />;

    return (
      <div>
        <h2>{this.state.albumData.name}</h2>
        <div className='album-main-details'>
          <p>{this.state.albumData.release_date}&emsp;/&emsp;{this.props.totalTracks} tracks</p>
          { this.renderOpenLink() }
          { this.renderCopyToClipboard() }
        </div>
        <div className='album-minor-details'>
          <p>{`Added on ${this.state.albumData.added_at}`}</p>
        </div>
        <div className='album-minor-details'>
          { this.renderGenresOrStyles('genres', 'Genres') }
          { this.renderGenresOrStyles('styles', 'Styles') }
        </div>
        { this.renderDiscogsForm() }
        {this.state.messageUpdateSuccess &&
          <Message message={this.state.messageUpdateSuccess} error={false}/>
        }
      </div>
    );
  }

  componentDidMount() {
    getRef('albums/' + this.props.id)     // Fetch album data from fb
      .on('value', (snapshot) => {        // Add listener for changes
        this.handleGetAlbumSuccess(snapshot.val());
      });
  }

  componentWillUpdate(nextProps, nextState) {
    if (!this.state.hasAlbumData) return;

    // If album has received a data update
    if (!this.state.albumData.hasOwnProperty('discogs_id') &&
        nextState.albumData.hasOwnProperty('discogs_id')) {

      this.setState({
        messageUpdateSuccess: 'Album successfully updated!'
      });

      // Timeout to hide success message
      this.timer = setTimeout(() => {
        this.setState({
          messageUpdateSuccess: null
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
            { this.renderAlbumCover() }
          </div>
          <div className='album-detail-container'>
            { this.renderAlbumDetails() }
          </div>
        </div>
      </div>
    );
  }
}

Album.propTypes = {
  id: PropTypes.string.isRequired,
  totalTracks: PropTypes.number.isRequired,
  isAdmin: PropTypes.bool.isRequired
};

export default Album;
