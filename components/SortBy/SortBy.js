import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
require('./SortBy.scss');

class SortBy extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      order: -1,
      orderLabel: this.props.labelDown,
      orderIcon: '../static/images/Arrowhead-Down-01-32.png'
    };

    this.handleClick = this.handleClick.bind(this);
  }

  handleClick() {
    const orderLabel = (this.state.order == 1) ? this.props.labelDown : this.props.labelUp;
    const orderIcon = (this.state.order == 1) ? '../static/images/Arrowhead-Down-01-32.png' : '../static/images/Arrowhead-01-32.png';

    this.setState({
      order: -this.state.order,
      orderLabel: orderLabel,
      orderIcon: orderIcon
    });

    this.props.sort(this.state.order);
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
