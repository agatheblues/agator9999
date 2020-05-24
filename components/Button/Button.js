import React from 'react';
import classNames from 'classnames';
import PropTypes from 'prop-types';
require('./Button.scss');

const Button = function ({ id, label, handleClick, disabled, invert }) {
  const classes = classNames({
    'btn': true,
    'btn--inverted': invert
  });

  return (
    <button
      id={id}
      className={classes}
      onClick={handleClick}
      disabled={disabled}
    >{label}</button>
  );
};

Button.defaultProps = {
  id: null,
  disabled: false,
  invert: false,
};

Button.propTypes = {
  id: PropTypes.string,
  label: PropTypes.string.isRequired,
  handleClick: PropTypes.func.isRequired,
  disabled: PropTypes.bool,
  invert: PropTypes.bool,
};

export default Button;
