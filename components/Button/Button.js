import React from 'react';
import PropTypes from 'prop-types';
require('./Button.scss');

const Button = ({id, label, handleClick}) => (
  <button
    id={id}
    className='btn btn-primary'
    onClick={handleClick}
  >{label}</button>
);

Button.propTypes = {
  id: PropTypes.string,
  label: PropTypes.string.isRequired,
  handleClick: PropTypes.func.isRequired
};

export default Button;
