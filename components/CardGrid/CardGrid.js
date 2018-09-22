import React from 'react';
import PropTypes from 'prop-types';
import { getAlbums, getArtists, formatArtistList } from '../../helpers/FirebaseHelper';
import Card from '../Card/Card';
import Message from '../Message/Message';
import Loading from '../Loading/Loading';
import Search from '../Search/Search';
import SortBy from '../SortBy/SortBy';
import EmptyList from '../EmptyList/EmptyList';
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
      activeSort: 'recently'
    };

    this.filterList = this.filterList.bind(this);
    this.sortListAlphabetically = this.sortListAlphabetically.bind(this);
    this.sortListRecently = this.sortListRecently.bind(this);
  }

  /**
   * Get total amount of albums in FB
   */
  getAlbumCount() {
    getAlbums()
      .then((data) => {
        let i = 0;
        data.forEach((item) => { i++; });
        this.handleCountSuccess(i);
      });
  }

  /**
   * Get list of all artists in FB
   */
  getArtistsList() {
    getArtists()
      .then((data) => this.handleSuccess(formatArtistList(data)))
      .catch((error) => this.handleError());
  }

  /**
   * Callback for successful fetch of artists, set artists to state
   * @param  {Array} artists  Array of FB artists
   */
  handleSuccess(artists) {
    const sortedArtists = this.sortListByDate(artists, 1);
    this.setState({
      artists: sortedArtists,
      visibleArtists: sortedArtists,
      loaded: true,
      error: false
    });
  }

  /**
   * Callback for counting total albums, set to state
   * @param  {Integer} count Total number of albums
   */
  handleCountSuccess(count) {
    this.setState({
      albumCount: count
    });
  }

  /**
   * Callback for errors.
   */
  handleError() {
    this.setState({
      artists: [],
      visibleArtists: [],
      loaded: true,
      error: true
    });
  }

  /**
   * Filters list of artists by artist name
   * @param  {String} input User search input
   */
  filterList(input) {
    const filteredArtists = this.state.artists.filter((artist) => {
      return artist.name.toLowerCase().indexOf(input.toLowerCase()) != -1;
    });

    this.setState({
      visibleArtists: filteredArtists
    });
  }

  /**
   * Sorts list of artists alphabetically
   * @param  {Integer} order 1 or -1 (asc or desc)
   */
  sortListAlphabetically(order) {
    const sortedArtists = this.state.visibleArtists.sort((a, b) => {
      return (a.name.toLowerCase() > b.name.toLowerCase()) ? order : -order;
    });

    this.setState({
      visibleArtists: sortedArtists,
      activeSort: 'alphabetically'
    });
  }

  /**
   * Sorts list of artists by date
   * @param  {array} artists  List of artists
   * @param  {Integer} order  1 or -1 (asc or desc)
   * @return {array}          Sorted list of artists
   */
  sortListByDate(artists, order) {
    return artists.sort((a, b) => {
      return order * (this.getMostRecentDate(b) - this.getMostRecentDate(a));
    });
  }

  /**
   * Set sorted by date artists to state
   * @param  {Integer} order  1 or -1 (asc or desc)
   */
  sortListRecently(order) {
    this.setState({
      visibleArtists: this.sortListByDate(this.state.visibleArtists, order),
      activeSort: 'recently'
    });
  }

  /**
   * Get most recent date of album addition for an artist
   * @param  {array} albums  artist's albums array
   * @return {Date}          most recent date of addition for an artist's albums
   */
  getMostRecentDate(artist) {
    if (!artist.hasOwnProperty('albums')) return new Date('1970-01-01Z00:00:00:000');
    let dates = Object.keys(artist.albums).map((albumKey) => new Date(artist.albums[albumKey].added_at));
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
              let totalAlbums = (artist.hasOwnProperty('albums')) ? Object.keys(artist.albums).length : 0;
              return(
                <div key={artist.id} >
                  <Card id={artist.id} name={artist.name} imgUrl={artist.imgUrl} totalAlbums={totalAlbums}/>
                </div>
              );
            })
          }
        </div>
      );
    }

    if ((this.state.artists.length != 0) && this.state.loaded && !this.state.error && (this.state.visibleArtists.length == 0)) {
      return <EmptyList message={'No results!'} />;
    }

    if ((this.state.artists.length == 0) && this.state.loaded && !this.state.error) {
      return <EmptyList message={'There is 0 artist in your library.'} />;
    }

    if (!this.state.loaded && !this.state.error) {
      return <Loading fullPage={false} label={'Loading artists...'}/>;
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
              labelUp='Z - A'
              labelDown='A - Z'
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
