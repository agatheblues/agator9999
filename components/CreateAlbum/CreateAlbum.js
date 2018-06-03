import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import SpotifyCreateAlbum from '../SpotifyCreateAlbum/SpotifyCreateAlbum';
import SearchDropdown from '../SearchDropdown/SearchDropdown';
import { getArtists } from '../../helpers/FirebaseHelper.js';

class CreateAlbum extends React.Component {

  constructor(props) {
    super();
    this.state = {
      source: 'bandcamp',
      artists: []
    };

    this.handleClick = this.handleClick.bind(this);
  }

  handleClick(e) {
    this.setState({
      source: e.target.id
    });
  }

  handleSuccess(artists) {
    this.setState({
      artists: artists.slice(0, 15)
    });
  }

  formatArtistList(data) {
    let artists = [];
    data.forEach(function(item) {
      let artist = item.val();
      artists.push({ 'id': item.key, 'name': artist.name} );
    });
    return artists;
  }

  getArtistsList() {
    getArtists()
      .then((data) => this.handleSuccess(this.formatArtistList(data)))
      .catch((error) => { console.log(error); });
  }

  renderForm() {
    switch (this.state.source) {
    case 'spotify':
      return <SpotifyCreateAlbum />;
    case 'bandcamp':
      return(
        <SearchDropdown list={ this.state.artists } id={ 'id' } value={ 'name' } placeholder={ 'Type an artist' }/>
      );
    default:
      return <p>Oops! This platform does not exist :(</p>;
    }
  }

  componentDidMount() {
    this.getArtistsList();
  }

  render() {
    return (
      <div className='content-container'>
        <div className='back-to-library'>
          <Link to='/'>&#9839; Back to library</Link>
        </div>
        <h2>Add new album</h2>
        <nav>
          <ul onClick={this.handleClick}>
            <li id='spotify' className={this.state.source == 'spotify' ? 'active' : ''}>From Spotify</li>
            <li id='bandcamp' className={this.state.source == 'bandcamp' ? 'active' : ''}>From Bandcamp</li>
          </ul>
        </nav>

        <div className='form-container'>
          {this.renderForm()}
        </div>
      </div>
    );
  }
}


export default CreateAlbum;
