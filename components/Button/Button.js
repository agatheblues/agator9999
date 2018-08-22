import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
require('./Button.scss');

const Button = function({id, label, handleClick, disabled}) {

  const btnClass = classNames({
    'btn': true,
    'btn--disabled': !{disabled}
  });

  return (
    <button
      id={id}
      className={btnClass}
      onClick={handleClick}
      disabled={disabled}
    >{label}</button>
  );
};

Button.propTypes = {
  id: PropTypes.string,
  label: PropTypes.string.isRequired,
  handleClick: PropTypes.func.isRequired,
  disabled: PropTypes.bool
};

export default Button;
