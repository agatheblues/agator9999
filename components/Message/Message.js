import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
require('./Message.scss');


const Message = function ({message, error}) {

  const messageClass = classNames({
    'msg': true,
    'msg--success': !{error}.error,
    'msg--error': {error}.error
  });

  return (
    <p className={messageClass}>{message}</p>
  );
};

Message.propTypes = {
  message: PropTypes.string,
  error: PropTypes.bool.isRequired
};

export default Message;
