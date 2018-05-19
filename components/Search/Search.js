import React from 'react';
import PropTypes from 'prop-types';
require('./Search.scss');

class Search extends React.Component {

  constructor(props) {
    super();

    this.handleChange = this.handleChange.bind(this);
  }

  handleChange(event) {
    this.props.filter(event.target.value);
  }

  render() {
    return (
      <div className='search-input-container'>
        <input
          type='text'
          onChange={this.handleChange}
          placeholder='Search for an artist' />
      </div>
    );
  }
}

Search.propTypes = {
  filter: PropTypes.func.isRequired
};

export default Search;
