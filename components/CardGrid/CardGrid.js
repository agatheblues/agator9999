import React from 'react';
import PropTypes from 'prop-types';
import Card from '../Card/Card';
import Message from '../Message/Message';
import { getAlbums, getArtists } from '../../helpers/FirebaseHelper';
require('./CardGrid.scss');

class CardGrid extends React.Component {

  constructor(props) {
    super();

    this.state = {
      artists: [],
      loaded: false,
      error: false,
      albumCount: 0
    };
  }

  handleSuccess(artists) {
    this.setState({
      artists: artists,
      loaded: true,
      error: false
    });
  }

  handleCountSuccess(count) {
    this.setState({
      albumCount: count
    });
  }

  handleError() {
    this.setState({
      artists: [],
      loaded: true,
      error: true
    });
  }

  getAlbumCount() {

    getAlbums()
      .then((data) => {
        let i = 0;
        data.forEach((item) => { i++; });
        this.handleCountSuccess(i);
      });

  }

  formatArtistList(data) {
    let artists = [];
    data.forEach(function(item) {
      let artist = item.val();
      artist['id'] = item.key;
      artists.push(artist);
    });
    return artists;
  }

  getArtistsList() {

    getArtists()
      .then((data) => this.handleSuccess(this.formatArtistList(data)))
      .catch((error) => this.handleError());

  }

  componentDidMount() {
    this.getArtistsList();
    this.getAlbumCount();
  }

  renderCards() {
    if ((this.state.artists.length != 0) && this.state.loaded && !this.state.error) {
      return (
        <div className='grid-container'>
          {
            this.state.artists.map((artist, index) => {
              return(
                <div key={index} >
                  <Card id={artist.id} name={artist.name} imgUrl={artist.imgUrl} totalAlbums={Object.keys(artist.albums).length}/>
                </div>
              );
            })
          }
        </div>
      );
    }

    if ((this.state.artists.length == 0) && this.state.loaded && !this.state.error) {
      return (<p className='cardgrid-message'>There is 0 artist in your library.</p>);
    }

    if (!this.state.loaded && !this.state.error) {
      return (<p className='cardgrid-message'>Loading your library...</p>);
    }

    if (this.state.loaded && this.state.error) {
      return (<Message message='Oops! Something went wrong while loading your library' error={this.state.error}/>);
    }
  }

  renderCounts() {
    return <p>{`${this.state.artists.length} artists, ${this.state.albumCount} albums`}</p>;
  }

  render() {
    return (
      <div>
        <div className='title-container title--marginlr'>
          <h1 className='title'>Artists</h1>
          {this.renderCounts()}
        </div>

        {this.renderCards()}
      </div>
    );
  }
};

export default CardGrid;
