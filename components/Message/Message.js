import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
require('./Message.scss');


const Message = function ({ message, error, style }) {

  if (style) {
    if (style == 'input-msg') {
      return (
        <div className='msg-input-error-container'>
          <p className='msg-input-error'>{message}</p>
        </div>
      );
    }

    if (style == 'input-msg-invert') {
      return (
        <div className='msg-input-error-container'>
          <p className='msg-input-error msg-input-error--inverted'>{message}</p>
        </div>
      );
    }
  }

  const messageClass = classNames({
    'msg': true,
    'msg--success': !{ error }.error,
    'msg--error': { error }.error
  });

  return (
    <p className={messageClass}>{message}</p>
  );

};

Message.propTypes = {
  message: PropTypes.string,
  error: PropTypes.bool.isRequired,
  style: PropTypes.string
};

export default Message;
