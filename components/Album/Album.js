import React from 'react';
import PropTypes from 'prop-types';
import Message from '../Message/Message';
import { getAlbum } from '../../helpers/FirebaseHelper';
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
      }
    };

    this.getGenres = this.getGenres.bind(this);
  }

  formatDate(dateString) {
    const date = new Date(dateString);
    let month = this.months[date.getMonth()];
    return month + ', ' + date.getFullYear();
  }

  handleGetAlbumSuccess(album) {
    console.log(album);
    // Format date
    album.added_at = this.formatDate(album.added_at);
    album.release_date = album.release_date.substr(0, 4);

    this.setState({
      hasAlbumData: true,
      albumData: album
    });
  }

  handleGetAlbumError() {
    this.setState({
      error: true
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
    getAlbum(this.props.id)
      .then((snapshot) => this.handleGetAlbumSuccess(snapshot.val()))
      .catch((error) => this.handleGetAlbumError());
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
    console.log(this.state);
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
                  <p><a href={this.state.albumData.url}>&#9836; {`Listen on ${this.state.albumData.source}`}</a></p>
                </div>
                <div className='album-minor-details'>
                  <p>{`Added on ${this.state.albumData.added_at}`}</p>
                </div>
                <div className='album-minor-details'>
                  <p>{this.getGenres()}</p>
                  <p>{this.getStyles()}</p>
                </div>
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
