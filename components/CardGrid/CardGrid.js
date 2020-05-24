import React from 'react';
import ArtistCard from '../ArtistCard/ArtistCard';
import AlbumCard from '../AlbumCard/AlbumCard';
import PropTypes from 'prop-types';
import Search from '../Search/Search';
import SortBy from '../SortBy/SortBy';
import EmptyList from '../EmptyList/EmptyList';
require('./CardGrid.scss');

class CardGrid extends React.Component {

  constructor(props) {
    super();

    this.state = {
      visibleItems: props.items,
      count: props.total,
      activeSort: 'recently'
    };

    this.filterItems = this.filterItems.bind(this);
    this.sortItemsAlphabetically = this.sortItemsAlphabetically.bind(this);
    this.sortItemsRecently = this.sortItemsRecently.bind(this);
  }

  /**
   * Filters list of items by name
   * @param  {String} input User search input
   */
  filterItems(input) {
    const filteredItems = this.props.items.filter((item) => {
      return item.name.toLowerCase().indexOf(input.toLowerCase()) != -1;
    });

    this.setState({
      visibleItems: filteredItems,
      count: filteredItems.length,
    });
  }

  /**
   * Sorts list of items alphabetically
   * @param  {Integer} order 1 or -1 (asc or desc)
   */
  sortItemsAlphabetically(order) {
    const sortedItems = this.state.visibleItems.sort((a, b) => {
      return (a.name.toLowerCase() > b.name.toLowerCase()) ? order : -order;
    });

    this.setState({
      visibleItems: sortedItems,
      activeSort: 'alphabetically'
    });
  }

  /**
   * Sorts list of items by updated_at date
   * @param  {Integer} order  1 or -1 (asc or desc)
   * @return {array}          Sorted list of artists
   */
  sortListByDate(order) {
    return this.state.visibleItems.sort((a, b) => {
      return this.props.resource === 'artists' ?
        order * (new Date(b.updated_at) - new Date(a.updated_at)) :
        order * (new Date(b.added_at) - new Date(a.added_at));
    });
  }

  /**
   * Set sorted by date artists to state
   * @param  {Integer} order  1 or -1 (asc or desc)
   */
  sortItemsRecently(order) {
    this.setState({
      visibleItems: this.sortListByDate(order),
      activeSort: 'recently'
    });
  }

  renderCards(count, visibleItems, items, resource) {
    if (items.length == 0) {
      return <EmptyList message={`There are no ${resource} in your library.`} />;
    }

    if (count == 0) {
      return <EmptyList message={'No results!'} />;
    }

    return (
      <div className='cardgrid-wrapper'>
        {resource === 'artists' && visibleItems.map(({ id, name, img_url, total_albums }) =>
          <ArtistCard key={id} id={id} name={name} imgUrl={img_url} totalAlbums={total_albums} />
        )
        }
        {resource === 'albums' && visibleItems.map(({ id, name, img_url }) =>
          <AlbumCard key={id} id={id} name={name} imgUrl={img_url} />
        )
        }
      </div>
    );
  }

  renderCount(count, resource) {
    return <p>{`${count} ${resource}`}</p>;
  }

  render() {
    const { activeSort, count, visibleItems } = this.state;
    const { items, resource } = this.props;

    return (
      <div>
        <div className='cardgrid-container'>
          {this.renderCount(count, resource)}
          <Search filter={this.filterItems} placeholder={`Search for ${resource}`} />
          <div className='sort-controls-container'>
            <SortBy
              type='recently'
              sort={this.sortItemsRecently}
              labelUp='Recently Added'
              labelDown='Recently Added'
              activeSort={activeSort}
            />
            <SortBy
              type='alphabetically'
              sort={this.sortItemsAlphabetically}
              labelUp='Z - A'
              labelDown='A - Z'
              activeSort={activeSort}
            />
          </div>
        </div>
        {this.renderCards(count, visibleItems, items, resource)}
      </div>
    );
  }
}

CardGrid.propTypes = {
  resource: PropTypes.string.isRequired,
  items: PropTypes.array.isRequired,
  total: PropTypes.number.isRequired,
};

export default CardGrid;
