import React from 'react';
import PropTypes from 'prop-types';
require('./DropdownMenu.scss');

class DropdownMenu extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      isOpen: false
    };

    this.showDropdown = this.showDropdown.bind(this);
    this.hideDropdown = this.hideDropdown.bind(this);
  }

  showDropdown(event) {
    event.preventDefault();
    this.setState({ isOpen: true });
    document.addEventListener('click', this.hideDropdown);
  }

  hideDropdown(event) {
    event.preventDefault();
    this.setState({ isOpen: false });
    document.removeEventListener('click', this.hideDropdown);
  }

  renderDropDownItems() {
    return this.props.list.map((item, index) => {
      return (
        <li
          key={index}
          value={item.label}
          onClick={() => item.handleSelectedValue()}
        >{item.label}</li>
      );
    });
  }

  render() {
    return (
      <div className={`dropdown-list ${this.state.isOpen ? 'open' : ''}`}>
        <a href='' className='icon album-menu-icon' onClick={this.showDropdown}>&#x22ee;</a>
        <ul className='dropdown-list-menu'>
          {this.renderDropDownItems()}
        </ul>
      </div>
    );
  }
}


DropdownMenu.propTypes = {
  list: PropTypes.array.isRequired
};

export default DropdownMenu;
