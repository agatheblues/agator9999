import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
require('./SortBy.scss');

class SortBy extends React.Component {

  constructor(props) {
    super();

    this.state = {
      active: false,
      order: 1,
      orderLabel: 'A - Z',
      orderIcon: '../static/images/Arrowhead-Down-01-32.png'
    };

    this.handleClick = this.handleClick.bind(this);
  }

  handleClick() {
    const orderLabel = (this.state.order == 1) ? 'A - Z' : 'Z - A';
    const orderIcon = (this.state.order == 1) ? '../static/images/Arrowhead-Down-01-32.png' : '../static/images/Arrowhead-01-32.png';

    this.setState({
      order: -this.state.order,
      orderLabel: orderLabel,
      orderIcon: orderIcon,
      active: true
    });

    this.props.sort(this.state.order);
  }

  render() {
    const linkClass = classNames({
      'sort-label': true,
      'sort-label--off': !this.state.active
    });

    return (
      <div className='sort-container sort-item-container--icon' onClick={ this.handleClick }>
        <img className='sort-icon' src={ this.state.orderIcon } alt='sort-button'/>
        <a className={ linkClass }>{ this.state.orderLabel }</a>
      </div>
    );
  }
}

SortBy.propTypes = {
  sort: PropTypes.func.isRequired
};

export default SortBy;
