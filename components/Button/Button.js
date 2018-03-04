import React from 'react';
import PropTypes from 'prop-types';

const Button = ({id, label, handleClick}) => (
  <button
    id={id}
    className="btn btn-primary"
    onClick={handleClick}
  >{label}</button>
);

Button.propTypes = {
  id: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  handleClick: PropTypes.func.isRequired
};

export default Button;
