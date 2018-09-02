import React from 'react';
import PropTypes from 'prop-types';
require('./Button.scss');

const Button = function({id, label, handleClick, disabled}) {

  return (
    <button
      id={id}
      className='btn'
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
