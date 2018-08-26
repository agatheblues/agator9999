import React from 'react';
import PropTypes from 'prop-types';
import Message from '../Message/Message';
import SpotifyUpdateAlbum from '../SpotifyUpdateAlbum/SpotifyUpdateAlbum';
import { getRef } from '../../helpers/FirebaseHelper';
require('./Album.scss');

class Album extends React.Component {

  constructor(props) {
    super();

    this.months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];

    this.state = {
      error: false,
      hasAlbumData: false,
      albumData: {
        source: '',
        added_at: ''
      },
      showDiscogsForm: false
    };

    this.getGenres = this.getGenres.bind(this);
    this.handleShowDiscogsClick = this.handleShowDiscogsClick.bind(this);
    this.handleHideDiscogsClick = this.handleHideDiscogsClick.bind(this);
  }

  formatDate(dateString) {
    const date = new Date(dateString);
    let month = this.months[date.getMonth()];
    return month + ', ' + date.getFullYear();
  }

  handleGetAlbumSuccess(album) {

    // Format date
    album.added_at = this.formatDate(album.added_at);
    album.release_date = album.release_date.substr(0, 4);

    this.setState({
      hasAlbumData: true,
      albumData: album,
      showDiscogsForm: false
    });
  }

  handleShowDiscogsClick(event) {
    event.preventDefault();
    this.setState({
      showDiscogsForm: true
    });
  }


  handleHideDiscogsClick(event) {
    event.preventDefault();
    this.setState({
      showDiscogsForm: false
    });
  }


  genreStyleReducer(accumulator, currentValue, currentIndex, array) {
    if (currentIndex == array.length - 1) {
      return accumulator + ' ' + currentValue;
    }

    return accumulator + ' ' + currentValue + ',';
  }

  getGenres() {
    let genres = 'Genres /';

    if (!this.state.albumData.hasOwnProperty('genres') || (this.state.albumData.genres.length == 0)) {
      return genres;
    }

    return this.state.albumData.genres.reduce(this.genreStyleReducer, genres);
  }

  getStyles() {
    let styles = 'Styles /';

    if (!this.state.albumData.hasOwnProperty('styles') || (this.state.albumData.styles.length == 0)) {
      return styles;
    }

    return this.state.albumData.styles.reduce(this.genreStyleReducer, styles);
  }

  componentDidMount() {
    getRef('albums/' + this.props.id)
      .on('value', (snapshot) => {
        this.handleGetAlbumSuccess(snapshot.val());
      });
  }

  renderAlbumCover() {
    let src = '';

    if (!this.state.albumData.hasOwnProperty('images') ||
        this.state.albumData.images.length == 0 ||
        !this.state.albumData.images[0].url
    ) {
      src = '/static/images/missing.jpg';
    } else {
      src = this.state.albumData.images[0].url;
    }

    return <a href={this.state.albumData.url}><img src={src} alt={'Album Cover'} className='album-cover'/></a>;
  }

  render() {
    return (
      <div className='content-container'>
        <div className='album-wrapper'>
          <div className='album-cover-container'>
            {this.renderAlbumCover()}
          </div>
          <div className='album-detail-container'>
            {!this.state.error &&
              <div>
                <h2>{this.state.albumData.name}</h2>
                <div className='album-main-details'>
                  <p>{this.state.albumData.release_date}&emsp;/&emsp;{this.props.totalTracks} tracks</p>
                  <p><a href={this.state.albumData.url}>&#9836; Listen on <span className='capitalize'>{this.state.albumData.source}</span></a></p>
                </div>
                <div className='album-minor-details'>
                  <p>{`Added on ${this.state.albumData.added_at}`}</p>
                </div>
                <div className='album-minor-details'>
                  <p>{this.getGenres()}</p>
                  <p>{this.getStyles()}</p>
                </div>

                { !this.state.albumData.discogs_id &&
                  this.state.hasAlbumData &&
                  !this.state.showDiscogsForm &&
                  <div className='album-minor-details'>
                    <p><a href='' onClick={this.handleShowDiscogsClick}>&#xFF0B; Link to Discogs</a></p>
                  </div>
                }

                { !this.state.albumData.discogs_id &&
                  this.state.hasAlbumData &&
                  this.state.showDiscogsForm &&
                  <div className='album-minor-details'>
                    <p><a href='' onClick={this.handleHideDiscogsClick}>&#xFF0D; Link to Discogs</a></p>
                  </div>
                }

                {this.state.showDiscogsForm &&
                  <SpotifyUpdateAlbum spotifyId={this.state.albumData.spotify_id} />
                }
              </div>
            }
            {this.state.error &&
              <Message message='Oops! There was a problem while retrieving data for this album.' error={this.state.error}/>
            }
          </div>
        </div>
      </div>
    );
  }
};

Album.propTypes = {
  id: PropTypes.string.isRequired,
  totalTracks: PropTypes.number.isRequired
};

export default Album;
