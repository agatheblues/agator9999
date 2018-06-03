import React from 'react';
import PropTypes from 'prop-types';
import Card from '../Card/Card';
import Message from '../Message/Message';
import Search from '../Search/Search';
import SortBy from '../SortBy/SortBy';
import { getAlbums, getArtists } from '../../helpers/FirebaseHelper';
require('./CardGrid.scss');

class CardGrid extends React.Component {

  constructor(props) {
    super();

    this.state = {
      artists: [],
      visibleArtists: [],
      loaded: false,
      error: false,
      albumCount: 0,
      activeSort: ''
    };

    this.filterList = this.filterList.bind(this);
    this.sortListAlphabetically = this.sortListAlphabetically.bind(this);
    this.sortListRecently = this.sortListRecently.bind(this);
  }

  handleSuccess(artists) {
    this.setState({
      artists: artists,
      visibleArtists: artists,
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
      visibleArtists: [],
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
      artist.id = item.key;
      artists.push(artist);
    });
    return artists;
  }

  getArtistsList() {

    getArtists()
      .then((data) => this.handleSuccess(this.formatArtistList(data)))
      .catch((error) => this.handleError());

  }

  filterList(input) {
    let visibleArtists = this.state.artists.filter((artist) => {
      return artist.name.toLowerCase().startsWith(input.toLowerCase());
    });

    this.setState({
      visibleArtists: visibleArtists
    });
  }

  sortListAlphabetically(order) {
    this.setState({
      visibleArtists: this.state.visibleArtists.sort((a, b) => {
        return (a.name.toLowerCase() > b.name.toLowerCase()) ? order : -order;
      }),
      activeSort: 'alphabetically'
    });
  }

  sortListRecently(order) {
    this.setState({
      visibleArtists: this.state.visibleArtists.sort((a, b) => {
        return order * (this.getMostRecentDate(b.albums) - this.getMostRecentDate(a.albums));
      }),
      activeSort: 'recently'
    });
  }

  getMostRecentDate(albums) {
    let dates = Object.keys(albums).map((albumKey) => new Date(albums[albumKey].added_at));
    return new Date(Math.max.apply(null, dates));
  }

  componentDidMount() {
    this.getArtistsList();
    this.getAlbumCount();
  }

  renderCards() {
    if ((this.state.artists.length != 0) && this.state.loaded && !this.state.error && (this.state.visibleArtists.length != 0)) {
      return (
        <div className='grid-container'>
          {
            this.state.visibleArtists.map((artist, index) => {
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

    if ((this.state.artists.length != 0) && this.state.loaded && !this.state.error && (this.state.visibleArtists.length == 0)) {
      return (<p className='cardgrid-message'>No results!</p>);
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
        <div className='title--marginlr'>
          <h1 className='title'>Artists</h1>
          {this.renderCounts()}
          <Search filter={this.filterList} placeholder='Search for an artist' />
          <div className='sort-controls-container'>
            <SortBy
              type='recently'
              sort={this.sortListRecently}
              labelUp='Recently Added'
              labelDown='Recently Added'
              activeSort={this.state.activeSort}
            />
            <SortBy
              type='alphabetically'
              sort={this.sortListAlphabetically}
              labelUp='A - Z'
              labelDown='Z- A'
              activeSort={this.state.activeSort}
            />
          </div>
        </div>

        {this.renderCards()}
      </div>
    );
  }
}

export default CardGrid;
