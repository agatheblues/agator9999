import React from 'react';
import { getArtists } from '../../helpers/DataHelper';
import Card from '../Card/Card';
import Message from '../Message/Message';
import Loading from '../Loading/Loading';
import Search from '../Search/Search';
import SortBy from '../SortBy/SortBy';
import EmptyList from '../EmptyList/EmptyList';
require('./CardGrid.scss');

class CardGrid extends React.Component {

  constructor() {
    super();

    this.state = {
      artists: [],
      visibleArtists: [],
      loaded: false,
      error: false,
      albumCount: 0,
      artistCount: 0,
      activeSort: 'recently'
    };

    this.filterArtists = this.filterArtists.bind(this);
    this.sortArtistAlphabetically = this.sortArtistAlphabetically.bind(this);
    this.sortArtistRecently = this.sortArtistRecently.bind(this);
  }

  getArtistsList() {
    getArtists()
      .then((response) => this.handleSuccess(response))
      .catch((error) => this.handleError());
  }

  handleSuccess(response) {
    const { data: { artists, total_albums, total_artists } } = response;

    this.setState({
      artists: artists,
      visibleArtists: artists,
      artistCount: total_artists,
      albumCount: total_albums,
      loaded: true,
      error: false
    });
  }

  handleError() {
    this.setState({
      loaded: true,
      error: true
    });
  }

  /**
   * Filters list of artists by artist name
   * @param  {String} input User search input
   */
  filterArtists(input) {
    const filteredArtists = this.state.artists.filter((artist) => {
      return artist.name.toLowerCase().indexOf(input.toLowerCase()) != -1;
    });
    const albumCount = filteredArtists.reduce((acc, artist) => acc + artist.total_albums, 0)

    this.setState({
      visibleArtists: filteredArtists,
      artistCount: filteredArtists.length,
      albumCount: albumCount
    });
  }

  /**
   * Sorts list of artists alphabetically
   * @param  {Integer} order 1 or -1 (asc or desc)
   */
  sortArtistAlphabetically(order) {
    const sortedArtists = this.state.visibleArtists.sort((a, b) => {
      return (a.name.toLowerCase() > b.name.toLowerCase()) ? order : -order;
    });

    this.setState({
      visibleArtists: sortedArtists,
      activeSort: 'alphabetically'
    });
  }

  /**
   * Sorts list of artists by updated_at date
   * @param  {Integer} order  1 or -1 (asc or desc)
   * @return {array}          Sorted list of artists
   */
  sortListByDate(order) {
    return this.state.visibleArtists.sort((a, b) => {
      return order * (new Date(b.updated_at) - new Date(a.updated_at));
    });
  }

  /**
   * Set sorted by date artists to state
   * @param  {Integer} order  1 or -1 (asc or desc)
   */
  sortArtistRecently(order) {
    this.setState({
      visibleArtists: this.sortListByDate(order),
      activeSort: 'recently'
    });
  }

  componentDidMount() {
    this.getArtistsList();
  }

  renderCards() {
    const { artists, loaded, error, artistCount, visibleArtists } = this.state;

    if ((artists.length != 0) && loaded && !error && (artistCount != 0)) {
      return (
        <div className='grid-container'>
          {
            visibleArtists.map(({ id, name, img_url, total_albums }) =>
              <Card key={id} id={id} name={name} imgUrl={img_url} totalAlbums={total_albums} />
            )
          }
        </div>
      );
    }

    if ((artists.length != 0) && loaded && !error && (artistCount == 0)) {
      return <EmptyList message={'No results!'} />;
    }

    if ((artists.length == 0) && loaded && !error) {
      return <EmptyList message={'There is 0 artist in your library.'} />;
    }

    if (!loaded && !error) {
      return <Loading fullPage={false} label={'Loading artists...'} />;
    }

    if (loaded && error) {
      return (<Message message='Oops! Something went wrong while loading your library' error={error} />);
    }
  }

  renderCounts() {
    return <p>{`${this.state.artistCount} artists, ${this.state.albumCount} albums`}</p>;
  }

  render() {
    return (
      <div>
        <div className='title--marginlr'>
          <h1 className='title'>Artists</h1>
          {this.renderCounts()}
          <Search filter={this.filterArtists} placeholder='Search for an artist' />
          <div className='sort-controls-container'>
            <SortBy
              type='recently'
              sort={this.sortArtistRecently}
              labelUp='Recently Added'
              labelDown='Recently Added'
              activeSort={this.state.activeSort}
            />
            <SortBy
              type='alphabetically'
              sort={this.sortArtistAlphabetically}
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
