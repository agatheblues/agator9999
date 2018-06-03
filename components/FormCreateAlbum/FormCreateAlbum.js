import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import SearchDropdown from '../SearchDropdown/SearchDropdown';
import { getArtists } from '../../helpers/FirebaseHelper.js';

class FormCreateAlbum extends React.Component {

  constructor(props) {
    super();

    this.state = {
      artists: []
    };
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


  componentDidMount() {
    this.getArtistsList();
  }
  
  render() {
    return (
      <SearchDropdown list={ this.state.artists } id={ 'id' } value={ 'name' } placeholder={ 'Type an artist' }/>
    );
  }
}


export default FormCreateAlbum;
