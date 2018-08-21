import React from 'react';
import PropTypes from 'prop-types';
require('./Dropdown.scss');

class Dropdown extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      isOpen: false
    };

    this.renderDataDropDown = this.renderDataDropDown.bind(this);
    this.showDropdown = this.showDropdown.bind(this);
    this.hideDropdown = this.hideDropdown.bind(this);
  }

  showDropdown() {
    this.setState({ isOpen: true });
    document.addEventListener('click', this.hideDropdown);
  }

  hideDropdown() {
    this.setState({ isOpen: false });
    document.removeEventListener('click', this.hideDropdown);
  }

  chooseItem(id, value) {
    if (this.props.handleSelectedValue) { this.props.handleSelectedValue(id); }
  }

  renderDataDropDown(item, index) {
    if (item.hide) { return; }
    
    return (
      <li
        key={index}
        value={item[this.props.id]}
        onClick={() => this.chooseItem(item[this.props.id], item[this.props.value])}
      >{item[this.props.value]}</li>
    );
  }

  render() {
    return (
      <div className={`dropdown ${this.state.isOpen ? 'open' : ''}`}>
        <div className='dropdown-toggle' onClick={this.showDropdown}>
          {this.props.selectedValue}
          <span className='caret'></span>
        </div>
        <ul className='dropdown-menu'>
          {this.props.list.map(this.renderDataDropDown)}
        </ul>
      </div>
    );
  }
}


Dropdown.propTypes = {
  list: PropTypes.array.isRequired,
  id: PropTypes.string.isRequired,
  value: PropTypes.string.isRequired,
  handleSelectedValue: PropTypes.func,
  selectedValue: PropTypes.string
};

export default Dropdown;
