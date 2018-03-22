import React from 'react';
import PropTypes from 'prop-types';

const ErrorMessage = ({message}) => (
  <p>{message}</p>
);

ErrorMessage.propTypes = {
  message: PropTypes.string
};

export default ErrorMessage;
