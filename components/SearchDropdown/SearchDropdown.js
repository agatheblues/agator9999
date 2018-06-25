import React from 'react';
import PropTypes from 'prop-types';
import InputText from '../InputText/InputText';
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
      filteredList: value ? this.filterList(value) : this.props.list
    });
    document.addEventListener('click', this.hideSearchDropdown);
  }

  filterList(value) {
    return this.props.list.filter((item) => {
      return item.name.toLowerCase().startsWith(value.toLowerCase());
    });
  }

  hideSearchDropdown(event) {
    if (event.target.id == 'search-dropdown-input') return;

    this.setState({ isOpen: false });
    document.removeEventListener('click', this.hideSearchDropdown);
  }

  chooseItem(value) {
    if (this.state.labelItem !== value) {
      this.setState({
        labelItem: value
      });

      this.props.handleValue(this.filterList(value)[0].id);
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
        <InputText
          placeholder={this.props.placeholder}
          handleFocus={this.showSearchDropdown}
          handleValue={this.showSearchDropdown}
          id={'search-dropdown-input'}
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
  placeholder: PropTypes.string.isRequired,
  handleValue: PropTypes.func.isRequired
};

export default SearchDropdown;
