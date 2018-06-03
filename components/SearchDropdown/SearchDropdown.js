import React from 'react';
import PropTypes from 'prop-types';
import Search from '../Search/Search';
require('./SearchDropdown.scss');

class SearchDropdown extends React.Component {

  constructor(props) {
    super();

    this.state = {
      isOpen: false,
      labelItem: '',
      filteredList: []
    };

    this.renderDataDropDown = this.renderDataDropDown.bind(this);
    this.showSearchDropdown = this.showSearchDropdown.bind(this);
    this.hideSearchDropdown = this.hideSearchDropdown.bind(this);
  }

  showSearchDropdown(value) {
    this.setState({
      isOpen: true,
      labelItem: value,
      filteredList: this.filterList(value)
    });
    document.addEventListener('click', this.hideSearchDropdown);
  }

  filterList(value) {
    return this.props.list.filter((item) => {
      return item.name.toLowerCase().startsWith(value.toLowerCase());
    });
  }

  hideSearchDropdown() {
    this.setState({ isOpen: false });
    document.removeEventListener('click', this.hideSearchDropdown);
  }

  chooseItem(value) {
    if (this.state.labelItem !== value) {
      this.setState({
        labelItem: value
      });
    }
  }

  renderDataDropDown(item, index) {
    return (
      <li
        key={index}
        value={item[this.props.id]}
        onClick={() => this.chooseItem(item[this.props.value])}
      >{item[this.props.value]}</li>
    );
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.list.length > 0) {
      this.setState({
        filteredList: nextProps.list
      });
    }
  }

  render() {
    return (
      <div className={`searchdropdown ${this.state.isOpen ? 'open' : ''}`}>
        <Search
          filter={this.showSearchDropdown}
          placeholder={this.props.placeholder}
          value={this.state.labelItem}
        />
        <ul className='searchdropdown-menu'>
          {this.state.filteredList.map(this.renderDataDropDown)}
        </ul>
      </div>
    );
  }
}


SearchDropdown.propTypes = {
  list: PropTypes.array.isRequired,
  id: PropTypes.string.isRequired,
  value: PropTypes.string.isRequired,
  placeholder: PropTypes.string.isRequired
};

export default SearchDropdown;
