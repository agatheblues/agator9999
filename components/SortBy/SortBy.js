import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
require('./SortBy.scss');

class SortBy extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      order: 1,
      orderLabel: this.props.labelDown,
      orderIcon: '../static/images/Arrowhead-Down-01-32.png'
    };

    this.handleClick = this.handleClick.bind(this);
  }

  handleClick() {
    let order = this.state.order;

    if (this.props.type === this.props.activeSort) {
      order = -order;
    };

    const orderLabel = (order == -1) ? this.props.labelUp : this.props.labelDown;
    const orderIcon = (order == -1) ? '../static/images/Arrowhead-01-32.png' : '../static/images/Arrowhead-Down-01-32.png';

    this.props.sort(order);

    this.setState({
      order,
      orderLabel: orderLabel,
      orderIcon: orderIcon
    });
  }

  render() {
    const linkClass = classNames({
      'sort-label': true,
      'sort-label--off': (this.props.type !== this.props.activeSort)
    });

    return (
      <div className='sort-container' onClick={ this.handleClick }>
        <img className='sort-icon' src={ this.state.orderIcon } alt='sort-button'/>
        <a className={ linkClass }>{ this.state.orderLabel }</a>
      </div>
    );
  }
}

SortBy.propTypes = {
  sort: PropTypes.func.isRequired,
  labelUp: PropTypes.string.isRequired,
  labelDown: PropTypes.string.isRequired,
  activeSort: PropTypes.string.isRequired,
  type: PropTypes.string.isRequired
};

export default SortBy;
